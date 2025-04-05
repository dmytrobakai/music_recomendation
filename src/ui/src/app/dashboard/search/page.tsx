"use client";

import { useState } from "react";
import { SearchBar } from "@/components/music/SearchBar";
import { MusicList, MusicItem } from "@/components/music/MusicList";

// Mock data for search results
const mockSearchResults: Record<string, MusicItem[]> = {
  "rock": [
    {
      id: "s1",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      coverImage: "https://via.placeholder.com/150",
      isLiked: true,
    },
    {
      id: "s2",
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: "Appetite for Destruction",
      coverImage: "https://via.placeholder.com/150",
      isLiked: false,
    },
    {
      id: "s3",
      title: "Back in Black",
      artist: "AC/DC",
      album: "Back in Black",
      coverImage: "https://via.placeholder.com/150",
      isLiked: false,
    },
  ],
  "pop": [
    {
      id: "s4",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      coverImage: "https://via.placeholder.com/150",
      isLiked: false,
    },
    {
      id: "s5",
      title: "Bad Guy",
      artist: "Billie Eilish",
      album: "When We All Fall Asleep, Where Do We Go?",
      coverImage: "https://via.placeholder.com/150",
      isLiked: true,
    },
    {
      id: "s6",
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      coverImage: "https://via.placeholder.com/150",
      isLiked: false,
    },
  ],
  "jazz": [
    {
      id: "s7",
      title: "Take Five",
      artist: "Dave Brubeck",
      album: "Time Out",
      coverImage: "https://via.placeholder.com/150",
      isLiked: false,
    },
    {
      id: "s8",
      title: "So What",
      artist: "Miles Davis",
      album: "Kind of Blue",
      coverImage: "https://via.placeholder.com/150",
      isLiked: false,
    },
  ],
};

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<MusicItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let results: MusicItem[] = [];
      
      // Check if query matches any of our mock categories
      if (lowerQuery === "rock" || lowerQuery === "pop" || lowerQuery === "jazz") {
        results = mockSearchResults[lowerQuery] || [];
      } else {
        // Search across all categories for matching titles or artists
        Object.values(mockSearchResults).forEach(categoryResults => {
          const matches = categoryResults.filter(
            item => 
              item.title.toLowerCase().includes(lowerQuery) || 
              item.artist.toLowerCase().includes(lowerQuery)
          );
          results = [...results, ...matches];
        });
      }
      
      setSearchResults(results);
      setLoading(false);
    }, 1000);
  };
  
  const handleLikeToggle = (id: string, liked: boolean) => {
    setSearchResults(prev =>
      prev.map(item => 
        item.id === id ? { ...item, isLiked: liked } : item
      )
    );
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