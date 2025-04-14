# file: db_models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# Association table for many-to-many relationship
user_likes = Table(
    'user_likes', Base.metadata,
    Column('username', String, ForeignKey('users.username'), primary_key=True),
    Column('song_id', Integer, ForeignKey('tracks.id'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    liked_songs = relationship('Track', secondary=user_likes, back_populates='liked_by')

class Artist(Base):
    __tablename__ = 'artists'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    tracks = relationship('Track', back_populates='artist')

class Track(Base):
    __tablename__ = 'tracks'

    id = Column(BigInteger, primary_key=True, autoincrement=False)  # API надає ID
    title = Column(String, nullable=False)
    link = Column(String)
    duration = Column(BigInteger)
    preview = Column(String)
    position = Column(BigInteger)
    rank = Column(BigInteger)
    explicit_lyrics = Column(Boolean) # Boolean, але з API може приходити як 0/1
    album_id = Column(BigInteger)
    album_title = Column(String)
    album_cover = Column(String)

    # Foreign key
    artist_id = Column(BigInteger, ForeignKey('artists.id'))

    # Relationships
    artist = relationship('Artist', back_populates='tracks')
    liked_by = relationship('User', secondary=user_likes, back_populates='liked_songs')
