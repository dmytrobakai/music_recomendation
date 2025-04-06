'use client';

import React, { useState, useEffect } from 'react';
import MusicCard from './MusicCard';

interface Song {
  id: number;
  title: string;
  artist: string;
}

interface MusicListProps {
  songs: Song[];
  title: string;
  emptyMessage?: string;
}

const MusicList: React.FC<MusicListProps> = ({ songs, title, emptyMessage = 'No songs found.' }) => {
  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load liked songs on component mount
  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch('http://localhost:8000/liked');
        if (response.ok) {
          const data = await response.json();
          setLikedSongs(data.map((song: Song) => song.id));
        }
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };
    
    fetchLikedSongs();
  }, []);
  
  const handleLike = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/like/${id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setLikedSongs(prev => [...prev, id]);
      }
    } catch (error) {
      console.error('Error liking song:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnlike = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/unlike/${id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setLikedSongs(prev => prev.filter(songId => songId !== id));
      }
    } catch (error) {
      console.error('Error unliking song:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If no songs are provided, show a message
  if (songs.length === 0) {
    return (
      <div style={{ marginBottom: 'var(--space-xxl)' }}>
        <h2 style={{ 
          marginBottom: 'var(--space-lg)',
          fontSize: '1.5rem',
          fontWeight: 600,
        }}>
          {title}
        </h2>
        
        <div style={{ 
          backgroundColor: 'var(--surface)',
          padding: 'var(--space-xl)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)'
        }}>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ marginBottom: 'var(--space-xxl)' }}>
      <h2 style={{ 
        marginBottom: 'var(--space-lg)',
        fontSize: '1.5rem',
        fontWeight: 600,
      }}>
        {title}
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {songs.map(song => (
          <MusicCard
            key={song.id}
            song={song}
            isLiked={likedSongs.includes(song.id)}
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
        ))}
      </div>
    </div>
  );
};

export default MusicList;