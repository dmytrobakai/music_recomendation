"use client";

import React, { useEffect, useState } from "react";

import { Song } from "@/types/song";
import MusicCard from "./MusicCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MusicListProps {
  songs: Song[];
  title: string;
  emptyMessage?: string;
}

const MusicList: React.FC<MusicListProps> = ({
  songs,
  title,
  emptyMessage = "No songs found.",
}) => {
  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = localStorage.getItem("username");

  // Load liked songs on component mount
  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`${API_URL}/liked/` + user);
        if (response.ok) {
          const data = await response.json();
          setLikedSongs(data.map((song: Song) => song.id));
        }
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, []);

  const handleLike = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/like/${id}/user/${user}`, {
        method: "POST",
      });

      if (response.ok) {
        setLikedSongs((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Error liking song:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/unlike/${id}/user/${user}`, {
        method: "POST",
      });

      if (response.ok) {
        setLikedSongs((prev) => prev.filter((songId) => songId !== id));
      }
    } catch (error) {
      console.error("Error unliking song:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArtist = async (artistId: number) => {
    try {
      const res = await fetch(`${API_URL}/artist/${artistId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Delete failed");
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // If no songs are provided, show a message
  if (songs.length === 0) {
    return (
      <div style={{ marginBottom: "var(--space-xxl)" }}>
        <h2
          style={{
            marginBottom: "var(--space-lg)",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          {title}
        </h2>

        <div
          style={{
            backgroundColor: "var(--surface)",
            padding: "var(--space-xl)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "var(--space-xxl)" }}>
      <h2
        style={{
          marginBottom: "var(--space-lg)",
          fontSize: "1.5rem",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "var(--space-lg)",
        }}
      >
        {songs.map((song) => (
          <MusicCard
            key={song.id}
            song={song}
            isLiked={likedSongs.includes(song.id)}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onDeleteArtist={handleDeleteArtist}
          />
        ))}
      </div>
    </div>
  );
};

export default MusicList;
