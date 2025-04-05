"use client";

import { useState, useEffect } from "react";
import { MusicList } from "@/components/music/MusicList";
import { musicApi, transformSongToMusicItem, MusicItem } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LikedSongsPage() {
  const [likedSongs, setLikedSongs] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load liked songs from API
  useEffect(() => {
    const fetchLikedSongs = async () => {
      setLoading(true);
      try {
        // Get liked songs from API
        const songs = await musicApi.getLikedSongs();
        
        // Transform to UI format with isLiked=true for all
        const musicItems = songs.map(song => transformSongToMusicItem(song, true));
        
        setLikedSongs(musicItems);
      } catch (error) {
        console.error("Failed to fetch liked songs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLikedSongs();
  }, [user]); // Refetch when user changes

  const handleLikeToggle = async (id: string, liked: boolean) => {
    const songId = parseInt(id);
    
    if (!liked) {
      try {
        // Unlike the song via API
        await musicApi.unlikeSong(songId);
        
        // Remove from UI
        setLikedSongs(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Failed to unlike song:", error);
      }
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