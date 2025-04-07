'use client';

import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
  
  // Search icon
  const searchIcon = (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
  
  return (
    <div className="fadeIn" style={{
      marginBottom: 'var(--space-xl)',
    }}>
      <form 
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          maxWidth: '700px',
          margin: '0 auto',
          gap: 'var(--space-md)',
          width: '100%',
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            type="text"
            placeholder="Search for songs or artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            disabled={isLoading}
            leftIcon={searchIcon}
            aria-label="Search query"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!query.trim() || isLoading}
          variant="primary"
          size="md"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;