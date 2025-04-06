'use client';

import Navbar from '@/components/layout/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Simple client-side auth check
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div>
      <Navbar />
      <main style={{ padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}