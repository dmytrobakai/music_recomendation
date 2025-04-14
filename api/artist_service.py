import requests
from sqlalchemy.orm import Session
from db_models import Artist
from db_config import SessionLocal
from init_db import init_db
import re


def fetch_artists_from_deezer(limit=10):
    url = f"https://api.deezer.com/chart/0/artists?limit={limit}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()['data']
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}")

def contains_cyrillic(text: str) -> bool:
    """Check if the text contains Cyrillic characters."""
    return bool(re.search(r'[а-яА-ЯёЁ]', text))

def save_artists_to_db(artists: list, db: Session):
    filtered = [a for a in artists if not contains_cyrillic(a['name'])]

    for artist in filtered:
        db_artist = Artist(
            id=artist['id'],
            name=artist['name']
        )
        existing = db.query(Artist).filter_by(id=db_artist.id).first()
        if not existing:
            db.add(db_artist)

    db.commit()
    print(f"Saved {len(filtered)} artists (excluded {len(artists) - len(filtered)} by filter).")



def upload_new_artists():
    init_db()
    session = SessionLocal()
    try:
        artists = fetch_artists_from_deezer(limit=50)
        save_artists_to_db(artists, session)
        print(f"{len(artists)} artists saved to PostgreSQL.")
    finally:
        session.close()
