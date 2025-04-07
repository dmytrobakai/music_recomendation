import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Music Recommendation App',
  description: 'Find and save your favorite songs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}