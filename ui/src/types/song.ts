// src/types/song.ts

export interface Song {
  id: number;
  title: string;
  link: string;
  duration: number;
  preview: string;
  position: string;
  rank: number;
  explicit_lyrics: number;
  artist_id: number;
  artist_name: string;
  album_id: number;
  album_title: string;
  album_cover: string;
}
