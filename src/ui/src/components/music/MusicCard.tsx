import React, { useState } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
}

interface MusicCardProps {
  song: Song;
  isLiked: boolean;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, isLiked, onLike, onUnlike }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLikeToggle = async () => {
    setIsLoading(true);
    try {
      if (isLiked) {
        await onUnlike(song.id);
      } else {
        await onLike(song.id);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a random color for the background
  const getGradientBackground = () => {
    const gradients = [
      'linear-gradient(135deg, #4F46E5, #7C3AED)',  // purple
      'linear-gradient(135deg, #0284C7, #0EA5E9)',  // blue
      'linear-gradient(135deg, #16A34A, #22C55E)',  // green
      'linear-gradient(135deg, #EA580C, #F97316)',  // orange
      'linear-gradient(135deg, #BE123C, #F43F5E)',  // red
    ];
    return gradients[song.id % gradients.length];
  };
  
  // Music note icon
  const MusicIcon = () => (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 18v-13l12-2v13" />
      <path d="M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
      <path d="M21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
    </svg>
  );

  // Heart/Like icon
  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke={filled ? 'none' : 'currentColor'}
      fill={filled ? 'var(--primary-color)' : 'none'}
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </svg>
  );
  
  return (
    <div 
      className="slideUp"
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform var(--transition-default), box-shadow var(--transition-default)',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        border: '1px solid var(--border-color)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        height: '160px',
        background: getGradientBackground(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: '#ffffff'
      }}>
        <MusicIcon />
      </div>
      
      <div style={{
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        <h3 style={{ 
          marginBottom: 'var(--space-xs)', 
          fontSize: '1.125rem',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {song.title}
        </h3>
        
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)', 
          marginBottom: 'var(--space-md)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {song.artist}
        </p>
        
        <button 
          onClick={handleLikeToggle}
          disabled={isLoading}
          aria-label={isLiked ? 'Unlike song' : 'Like song'}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: isLiked ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-sm)',
            marginTop: 'auto',
            borderRadius: 'var(--radius-pill)',
            transition: 'all var(--transition-fast)',
            opacity: isHovered || isLiked ? 1 : 0.7,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            },
            '&:disabled': {
              opacity: 0.5,
              cursor: 'not-allowed'
            }
          }}
        >
          <HeartIcon filled={isLiked} />
        </button>
      </div>
    </div>
  );
};

export default MusicCard;