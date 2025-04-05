"use client";

import { useState, useEffect } from "react";
import { MusicList, MusicItem } from "@/components/music/MusicList";

// Mock data for liked songs
const mockLikedSongs: MusicItem[] = [
  {
    id: "l1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    coverImage: "https://via.placeholder.com/150",
    isLiked: true,
  },
  {
    id: "l2",
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    coverImage: "https://via.placeholder.com/150",
    isLiked: true,
  },
  {
    id: "l3",
    title: "Bad Guy",
    artist: "Billie Eilish",
    album: "When We All Fall Asleep, Where Do We Go?",
    coverImage: "https://via.placeholder.com/150",
    isLiked: true,
  },
];

export default function LikedSongsPage() {
  const [likedSongs, setLikedSongs] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading liked songs
  useEffect(() => {
    const timer = setTimeout(() => {
      setLikedSongs(mockLikedSongs);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLikeToggle = (id: string, liked: boolean) => {
    if (!liked) {
      // Remove from liked songs if unliked
      setLikedSongs((prev) => prev.filter((item) => item.id !== id));
    } else {
      // Update liked status
      setLikedSongs((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isLiked: liked } : item))
      );
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-6">Liked Songs</h1>
        <p className="text-gray-600">
          Your collection of favorite tracks.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading liked songs...</p>
        </div>
      ) : likedSongs.length > 0 ? (
        <MusicList items={likedSongs} onLikeToggle={handleLikeToggle} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            You haven't liked any songs yet. Start exploring and like some songs!
          </p>
        </div>
      )}
    </div>
  );
}