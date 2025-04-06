from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import random

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

DB_PATH = "./notebooks/artists.db"

class User(BaseModel):
    username: str

class Song(BaseModel):
    id: int
    title: str
    artist: str

class SongList(BaseModel):
    songs: List[Song]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_likes (
            username TEXT,
            song_id INTEGER,
            PRIMARY KEY (username, song_id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.post("/login", tags=["Auth"])
def login(user: User):
    """Login or register a user (no-op since it's mock)"""
    return {"message": "Login successful", "username": user.username}

@app.get("/songs", tags=["Songs"])
def list_all_songs():
    """List 10 random songs from the database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tracks")
    all_tracks = cursor.fetchall()
    conn.close()

    if not all_tracks:
        return {"error": "No songs in database"}

    random_songs = random.sample(all_tracks, min(10, len(all_tracks)))
    return [dict(song) for song in random_songs]

@app.get("/liked/{username}", tags=["Likes"])
def get_liked_songs(username: str):
    """Get liked songs for the user"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.* FROM tracks t
        JOIN user_likes ul ON t.id = ul.song_id
        WHERE ul.username = ?
    """, (username,))
    liked = cursor.fetchall()
    conn.close()
    return [dict(song) for song in liked]

@app.post("/like/{song_id}/user/{username}", tags=["Likes"])
def like_song(song_id: int, username: str):
    """Like a song by ID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO user_likes (username, song_id) VALUES (?, ?)", (username, song_id))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    conn.close()
    return {"message": f"Song {song_id} liked by {username}"}

@app.post("/unlike/{song_id}/user/{username}", tags=["Likes"])
def unlike_song(song_id: int, username: str):
    """Unlike a song by ID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM user_likes WHERE username = ? AND song_id = ?", (username, song_id))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    conn.close()
    return {"message": f"Song {song_id} unliked by {username}"}

@app.delete("/artist/{artist_id}", tags=["Artists"])
def delete_artist_and_songs(artist_id: int):
    """Delete an artist and all their songs"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # Delete liked references
        cursor.execute("""
            DELETE FROM user_likes
            WHERE song_id IN (
                SELECT id FROM tracks WHERE artist_id = ?
            )
        """, (artist_id,))

        # Delete tracks
        cursor.execute("DELETE FROM tracks WHERE artist_id = ?", (artist_id,))

        # Delete artist
        cursor.execute("DELETE FROM artists WHERE id = ?", (artist_id,))

        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error deleting artist: {e}")
    
    conn.close()
    return {"message": f"Artist {artist_id} and all their songs removed."}

