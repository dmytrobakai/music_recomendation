'use client';

import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(130deg, #120e29, #1e1e1e)',
      padding: 'var(--space-md)'
    }}>
      <LoginForm />
    </div>
  );
}