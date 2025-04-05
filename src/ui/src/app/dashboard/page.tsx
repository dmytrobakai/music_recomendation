"use client";

import { useState, useEffect } from "react";
import { MusicList, MusicItem } from "@/components/music/MusicList";

// Mock data for recommendations
const mockRecommendations: MusicItem[] = [
  {
    id: "rec1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    coverImage: "https://via.placeholder.com/150",
    isLiked: false,
  },
  {
    id: "rec2",
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    coverImage: "https://via.placeholder.com/150",
    isLiked: true,
  },
  {
    id: "rec3",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    coverImage: "https://via.placeholder.com/150",
    isLiked: false,
  },
  {
    id: "rec4",
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    album: "F*CK LOVE 3: OVER YOU",
    coverImage: "https://via.placeholder.com/150",
    isLiked: false,
  },
  {
    id: "rec5",
    title: "good 4 u",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    coverImage: "https://via.placeholder.com/150",
    isLiked: false,
  },
  {
    id: "rec6",
    title: "MONTERO (Call Me By Your Name)",
    artist: "Lil Nas X",
    album: "MONTERO",
    coverImage: "https://via.placeholder.com/150",
    isLiked: false,
  },
];

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading recommendations
  useEffect(() => {
    const timer = setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLikeToggle = (id: string, liked: boolean) => {
    setRecommendations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLiked: liked } : item
      )
    );
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-6">Welcome Back!</h1>
        <p className="text-gray-600">
          Here are some personalized recommendations for you.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading recommendations...</p>
          </div>
        ) : (
          <MusicList items={recommendations} onLikeToggle={handleLikeToggle} />
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recently Played</h2>
        <p className="text-gray-500">No recent activity. Start playing some music!</p>
      </div>
    </div>
  );
}
