"use client";

import { useState, useEffect } from "react";
import { MusicList } from "@/components/music/MusicList";
import { musicApi, transformSongToMusicItem, MusicItem } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Load recommendations from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Fetch liked songs to know which ones are already liked
        const likedSongs = await musicApi.getLikedSongs();
        const likedIds = new Set(likedSongs.map(song => song.id));
        
        // Fetch recommended songs
        const recommendedSongs = await musicApi.getRecommendedSongs();
        
        // Transform API songs to UI MusicItems, marking as liked if needed
        const musicItems = recommendedSongs.map(song => 
          transformSongToMusicItem(song, likedIds.has(song.id))
        );
        
        setRecommendations(musicItems);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const handleLikeToggle = async (id: string, liked: boolean) => {
    const songId = parseInt(id);
    
    try {
      if (liked) {
        await musicApi.likeSong(songId);
      } else {
        await musicApi.unlikeSong(songId);
      }
      
      // Update UI state
      setRecommendations(prev =>
        prev.map(item => 
          item.id === id ? { ...item, isLiked: liked } : item
        )
      );
    } catch (error) {
      console.error("Failed to update like status:", error);
    }
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
