from fastapi import FastAPI, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import random
from collections import defaultdict

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
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL
        )
    ''')

    # Створити таблицю лайків
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
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str

@app.post("/login")
def login(data: LoginRequest):
    username = data.username
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    if user:
        conn.close()
        return {"message": f"Welcome back, {username}!"}
    
    try:
        cursor.execute("INSERT INTO users (username) VALUES (?)", (username,))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=500, detail="Error creating user")

    conn.close()
    return {"message": f"New user created: {username}"}

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

def jaccard_similarity(set1, set2):
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union != 0 else 0

@app.get("/recommendations/{username}")
def recommend_songs(username: str, top_n: int = 5):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT username, song_id FROM user_likes")
    likes_data = cursor.fetchall()

    # 2. Побудувати user -> set(song_id)
    user_likes = defaultdict(set)
    for row in likes_data:
        user_likes[row['username']].add(row['song_id'])

    if username not in user_likes:
        raise HTTPException(status_code=404, detail="User not found or no likes yet.")

    target_likes = user_likes[username]
    scores = defaultdict(float)

    # 3. Порівняння з іншими користувачами
    for other_user, other_likes in user_likes.items():
        if other_user == username:
            continue
        similarity = jaccard_similarity(target_likes, other_likes)
        for song_id in other_likes - target_likes:
            scores[song_id] += similarity

    # 4. Top-N результат
    sorted_scores = sorted(scores.items(), key=lambda x: -x[1])
    top_song_ids = [song_id for song_id, _ in sorted_scores[:top_n]]

    if not top_song_ids:
        return []

    # 5. Отримати інформацію про треки
    placeholders = ','.join('?' * len(top_song_ids))
    cursor.execute(f"SELECT * FROM tracks WHERE id IN ({placeholders})", top_song_ids)
    recommended = cursor.fetchall()

    conn.close()
    return [dict(song) for song in recommended]