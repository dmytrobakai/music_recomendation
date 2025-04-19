from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from collections import defaultdict
import random
from typing import Optional
import httpx 
from db_models import User as DBUser, Track, Artist, user_likes
from db_config import SessionLocal
from init_db import init_db
import os
from dotenv import load_dotenv

load_dotenv

API_URL= os.environ["API_URL"]
app = FastAPI(
    title="MusicApp API",
    description="Simple music app with liked songs and recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LoginRequest(BaseModel):
    username: str

class SongOut(BaseModel):
    id: float
    title: str
    link: str
    duration: int
    preview: str
    position: Optional[float] = None
    rank: float
    explicit_lyrics: bool
    album_id: float
    album_title: str
    album_cover: str
    artist_id: float

    class Config:
        orm_mode = True


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == data.username).first()
    if user:
        return {"message": f"Welcome back, {data.username}!"}

    try:
        new_user = DBUser(username=data.username)
        db.add(new_user)
        db.commit()
    except Exception:
        raise HTTPException(status_code=500, detail="Error creating user")

    return {"message": f"New user created: {data.username}"}


@app.get("/songs", response_model=List[SongOut], tags=["Songs"])
def list_all_songs(db: Session = Depends(get_db)):
    all_songs = db.query(Track).all()
    if not all_songs:
        raise HTTPException(status_code=404, detail="No songs in database")
    return random.sample(all_songs, min(10, len(all_songs)))


@app.get("/liked/{username}", response_model=List[SongOut], tags=["Likes"])
def get_liked_songs(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user or not user.liked_songs:
        return []
    return user.liked_songs


@app.post("/like/{song_id}/user/{username}", tags=["Likes"])
def like_song(song_id: int, username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    song = db.query(Track).filter(Track.id == song_id).first()

    if not user or not song:
        raise HTTPException(status_code=404, detail="User or Song not found")

    if song not in user.liked_songs:
        user.liked_songs.append(song)
        db.commit()

    return {"message": f"Song {song_id} liked by {username}"}


@app.post("/unlike/{song_id}/user/{username}", tags=["Likes"])
def unlike_song(song_id: int, username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.liked_songs = [s for s in user.liked_songs if s.id != song_id]
    db.commit()

    return {"message": f"Song {song_id} unliked by {username}"}


@app.delete("/artist/{artist_id}", tags=["Artists"])
def delete_artist_and_songs(artist_id: int, db: Session = Depends(get_db)):
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    # Remove likes to tracks by this artist
    for track in artist.tracks:
        db.execute(user_likes.delete().where(user_likes.c.song_id == track.id))
    # Delete tracks and artist
    for track in artist.tracks:
        db.delete(track)
    db.delete(artist)
    db.commit()
    return {"message": f"Artist {artist_id} and all their songs removed."}


@app.get("/recommendations/{username}", response_model=List[SongOut])
def recommend_songs(username: str, top_n: int = 5, db: Session = Depends(get_db)):
    try:
        users = db.query(DBUser).all()
        user_likes_map = defaultdict(set)

        for user in users:
            for song in user.liked_songs:
                user_likes_map[user.username].add(song.id)

        if username not in user_likes_map:
            return []

        target_likes = user_likes_map[username]
        scores = defaultdict(float)

        for other_user, other_likes in user_likes_map.items():
            if other_user == username:
                continue
            intersection = len(target_likes & other_likes)
            union = len(target_likes | other_likes)
            similarity = intersection / union if union else 0
            for song_id in other_likes - target_likes:
                scores[song_id] += similarity

        top_song_ids = [song_id for song_id, _ in sorted(scores.items(), key=lambda x: -x[1])[:top_n]]
        if not top_song_ids:
            print("Error to retrieve recommendation songs")
            return []

        return db.query(Track).filter(Track.id.in_(top_song_ids)).all()
    except Exception as e:
        print("Error to retrieve recommendation songs")
        return []

@app.get("/ml-recommendations/{username}", response_model=List[SongOut], tags=["ML Recommendations"])
def ml_recommend_songs(username: str, top_k: int = 10, db: Session = Depends(get_db)):
    try:
        api2_url = f"{API_URL}/recommend/{username}?top_k={top_k}"
        response = httpx.get(api2_url)
        response.raise_for_status()
        data = response.json()
        track_ids = data.get("recommended_track_ids", [])
    except Exception as e:
        return []

    if not track_ids:
        return []

    songs = db.query(Track).filter(Track.id.in_(track_ids)).all()
    return songs