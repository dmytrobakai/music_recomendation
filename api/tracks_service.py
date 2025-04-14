import requests
import time
from sqlalchemy.orm import Session
from db_models import Artist, Track
from db_config import SessionLocal
from init_db import init_db

def fetch_and_save_tracks(db: Session):
    artists = db.query(Artist).all()

    for artist in artists:
        try:
            print(f"Fetching tracks for {artist.name}...")
            # Використовуємо пошук по імені
            response = requests.get(f"https://api.deezer.com/search?q=artist:\"{artist.name}\"")
            if response.status_code == 200:
                tracks = response.json()['data']
                for track in tracks:
                    album = track.get("album", {})
                    if not db.query(Track).filter_by(id=track['id']).first():
                        db_track = Track(
                            id=track['id'],
                            title=track['title'],
                            link=track['link'],
                            duration=track['duration'],
                            preview=track['preview'],
                            position=track.get('position'),
                            rank=track['rank'],
                            explicit_lyrics=track['explicit_lyrics'],
                            artist_id=artist.id,
                            album_id=album.get('id'),
                            album_title=album.get('title'),
                            album_cover=album.get('cover_medium')
                        )
                        db.add(db_track)
                db.commit()
            else:
                print(f"Error fetching tracks for {artist.name} ({response.status_code})")
        except Exception as e:
            print(f"Error for {artist.name}: {e}")
        time.sleep(0.3)


def fetch_tracks():
    init_db()
    session = SessionLocal()
    try:
        fetch_and_save_tracks(session)
        print("Tracks saved to PostgreSQL.")
    finally:
        session.close()
