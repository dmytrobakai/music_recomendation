from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List

app = FastAPI()

mock_users = {
    "user1": {"username": "user1", "liked_songs": [1, 2]},
}

mock_songs = {
    1: {"id": 1, "title": "Song A", "artist": "Artist A"},
    2: {"id": 2, "title": "Song B", "artist": "Artist B"},
    3: {"id": 3, "title": "Song C", "artist": "Artist C"},
    4: {"id": 4, "title": "Song D", "artist": "Artist D"},
    5: {"id": 5, "title": "Song E", "artist": "Artist E"},
}

class User(BaseModel):
    username: str

class Song(BaseModel):
    id: int
    title: str
    artist: str

class SongList(BaseModel):
    songs: List[Song]

# Dependency to get user

def get_current_user():
    return mock_users["user1"]

@app.post("/login")
def login(user: User):
    if user.username in mock_users:
        return {"message": "Login successful", "username": user.username}
    else:
        mock_users[user.username] = {"username": user.username, "liked_songs": []}
        return {"message": "User created and logged in", "username": user.username}

@app.get("/user")
def get_user_data(user=Depends(get_current_user)):
    return user

@app.get("/songs")
def list_all_songs():
    return list(mock_songs.values())

@app.get("/search")
def search_songs(query: str):
    result = [song for song in mock_songs.values() if query.lower() in song["title"].lower()]
    return result

@app.get("/liked")
def get_liked_songs(user=Depends(get_current_user)):
    return [mock_songs[song_id] for song_id in user["liked_songs"]]

@app.post("/like/{song_id}")
def like_song(song_id: int, user=Depends(get_current_user)):
    if song_id not in mock_songs:
        raise HTTPException(status_code=404, detail="Song not found")
    if song_id not in user["liked_songs"]:
        user["liked_songs"].append(song_id)
    return {"message": "Song liked", "liked_songs": user["liked_songs"]}

@app.post("/unlike/{song_id}")
def unlike_song(song_id: int, user=Depends(get_current_user)):
    if song_id in user["liked_songs"]:
        user["liked_songs"].remove(song_id)
    return {"message": "Song unliked", "liked_songs": user["liked_songs"]}

@app.get("/recommended")
def get_recommended_songs(user=Depends(get_current_user)):
    liked = set(user["liked_songs"])
    recommended = [song for song_id, song in mock_songs.items() if song_id not in liked]
    return recommended[:3]
