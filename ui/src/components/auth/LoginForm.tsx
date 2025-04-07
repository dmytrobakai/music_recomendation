'use client';

import React, { useState } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Username is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock API call
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // In a real app, save token or session info here
        localStorage.setItem('username', username);
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Something went wrong');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  // User icon for input
  const userIcon = (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
  
  return (
    <div className="slideUp" style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: 'var(--space-xxl) var(--space-lg)',
      backgroundColor: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-color)'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: 'var(--space-xl)', 
        color: 'var(--primary-color)',
        fontSize: '1.8rem'
      }}>
        Music Recommendation
      </h1>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          fullWidth
          disabled={isLoading}
          leftIcon={userIcon}
          aria-label="Username"
        />
        
        <Button 
          type="submit" 
          fullWidth 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Logging in...' : 'Login / Register'}
        </Button>
      </form>
      
      <p style={{ 
        textAlign: 'center', 
        marginTop: 'var(--space-xl)', 
        fontSize: '0.875rem', 
        color: 'var(--text-secondary)' 
      }}>
        Enter any username to login or create account
      </p>
    </div>
  );
};

export default LoginForm;