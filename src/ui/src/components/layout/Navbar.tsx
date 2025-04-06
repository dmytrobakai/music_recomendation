'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const navLinks = [
    { name: 'Discover', path: '/dashboard', icon: DiscoverIcon },
    { name: 'Search', path: '/dashboard/search', icon: SearchIcon },
    { name: 'Liked Songs', path: '/dashboard/liked', icon: HeartIcon },
  ];

  const handleLogout = () => {
    // In a real app, clear tokens/session
    localStorage.removeItem('username');
    router.push('/auth/login');
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(18, 18, 18, 0.9)',
      backdropFilter: 'blur(10px)',
      padding: 'var(--space-md) var(--space-xl)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: 'var(--shadow-sm)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
        <h2 style={{ 
          color: 'var(--primary-color)', 
          fontSize: '1.25rem',
          fontWeight: '700',
        }}>
          MusicApp
        </h2>
        
        <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <div style={{
                  color: isActive ? 'var(--primary-color)' : 'var(--text-primary)',
                  fontWeight: isActive ? '600' : '500',
                  padding: 'var(--space-sm) var(--space-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  position: 'relative',
                  transition: 'all var(--transition-fast)',
                }}>
                  <span style={{ 
                    display: 'flex',
                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)'
                  }}>
                    {link.icon()}
                  </span>
                  <span>{link.name}</span>
                  
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: 'var(--radius-pill)',
                    }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-sm)',
          backgroundColor: 'var(--surface-light)',
          padding: 'var(--space-sm) var(--space-md)',
          borderRadius: 'var(--radius-pill)',
        }}>
          <UserIcon />
          <span style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            fontWeight: '500',
          }}>
            {typeof window !== 'undefined' ? localStorage.getItem('username') : 'User'}
          </span>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleLogout} icon={<LogoutIcon />}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

// Icon components
function DiscoverIcon() {
  return (
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
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function SearchIcon() {
  return (
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
}

function HeartIcon() {
  return (
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default Navbar;