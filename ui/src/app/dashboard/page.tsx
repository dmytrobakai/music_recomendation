'use client';

import React, { useEffect, useState } from 'react';
import MusicList from '@/components/music/MusicList';

interface Song {
  id: number;
  title: string;
  artist: string;
}

export default function Dashboard() {
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username') || '');
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch recommended songs and all songs in parallel
        const [recommendedResponse, allSongsResponse] = await Promise.all([
          fetch('http://localhost:8000/recommended'),
          fetch('http://localhost:8000/songs')
        ]);
        
        const recommendedData = await recommendedResponse.json();
        const allSongsData = await allSongsResponse.json();
        
        setRecommendedSongs(recommendedData);
        setAllSongs(allSongsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load music data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-md)' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-xxl)', 
          color: 'var(--text-secondary)' 
        }}>
          <LoadingSpinner />
          <p style={{ marginTop: 'var(--space-lg)' }}>Loading your music recommendations...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-md)' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-xxl)', 
          color: 'var(--error)' 
        }}>
          <ErrorIcon />
          <p style={{ marginTop: 'var(--space-lg)' }}>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container slideUp" style={{ padding: 'var(--space-xl) var(--space-md)' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 700,
          background: 'linear-gradient(to right, var(--primary-color), #4ade80)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {username ? `Welcome, ${username}` : 'Discover Music'}
        </h1>
        
        <p style={{ color: 'var(--text-secondary)' }}>
          Explore new music and find your next favorite songs.
        </p>
      </header>
      
      {recommendedSongs.length > 0 && (
        <MusicList 
          title="Recommended for You" 
          songs={recommendedSongs}
          emptyMessage="No recommendations available yet. Try liking some songs first!"
        />
      )}
      
      <MusicList title="All Songs" songs={allSongs} />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'inline-block' }}>
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ 
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          }
        }}
      >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}