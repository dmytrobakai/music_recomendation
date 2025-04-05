"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/music/SearchBar";
import { MusicList } from "@/components/music/MusicList";
import { musicApi, transformSongToMusicItem, MusicItem } from "@/lib/api";

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<MusicItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set());

  // Get liked songs on initial load to know which results are already liked
  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const likedSongs = await musicApi.getLikedSongs();
        setLikedSongIds(new Set(likedSongs.map(song => song.id)));
      } catch (error) {
        console.error("Failed to fetch liked songs:", error);
      }
    };
    
    fetchLikedSongs();
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Search songs through API
      const results = await musicApi.searchSongs(query);
      
      // Transform to UI format and mark as liked if necessary
      const musicItems = results.map(song => 
        transformSongToMusicItem(song, likedSongIds.has(song.id))
      );
      
      setSearchResults(musicItems);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLikeToggle = async (id: string, liked: boolean) => {
    const songId = parseInt(id);
    
    try {
      if (liked) {
        await musicApi.likeSong(songId);
        setLikedSongIds(prev => new Set(prev).add(songId));
      } else {
        await musicApi.unlikeSong(songId);
        const newLikedIds = new Set(likedSongIds);
        newLikedIds.delete(songId);
        setLikedSongIds(newLikedIds);
      }
      
      // Update UI state
      setSearchResults(prev =>
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
        <h1 className="text-2xl font-bold mb-6">Search Music</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {hasSearched && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : (
            <MusicList items={searchResults} onLikeToggle={handleLikeToggle} />
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="mt-8 text-center py-12">
          <p className="text-gray-500">Search for your favorite songs, artists, or genres above!</p>
        </div>
      )}
    </div>
  );
}