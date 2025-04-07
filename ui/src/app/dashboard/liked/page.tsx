"use client";

import { useEffect, useState } from "react";

import MusicList from "@/components/music/MusicList";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Song {
  id: number;
  title: string;
  link: string;
  duration: number;
  preview: string;
  position: string;
  rank: number;
  explicit_lyrics: number;
  artist_id: number;
  artist_name: string;
  album_id: number;
  album_title: string;
  album_cover: string;
}

export default function LikedSongs() {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      setLoading(true);
      const username = localStorage.getItem("username");
      try {
        const response = await fetch("http://localhost:8000/liked/" + username);
        if (!response.ok) {
          throw new Error("Failed to fetch liked songs");
        }
        const data = await response.json();
        setLikedSongs(data);
      } catch (err) {
        console.error("Error fetching liked songs:", err);
        setError("Failed to load your liked songs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedSongs();
  }, []);

  const handleExplore = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "var(--space-xl) var(--space-md)" }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-xxl)",
            color: "var(--text-secondary)",
          }}
        >
          <LoadingSpinner />
          <p style={{ marginTop: "var(--space-lg)" }}>
            Loading your liked songs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ padding: "var(--space-xl) var(--space-md)" }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-xxl)",
            color: "var(--error)",
          }}
        >
          <ErrorIcon />
          <p style={{ marginTop: "var(--space-lg)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container slideUp"
      style={{ padding: "var(--space-xl) var(--space-md)" }}
    >
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Your Liked Songs</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          All your favorite tracks in one place
        </p>
      </header>

      {likedSongs.length === 0 ? (
        <div
          className="fadeIn"
          style={{
            backgroundColor: "var(--surface)",
            padding: "var(--space-xxl)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-lg)",
          }}
        >
          <EmptyLikedIcon />

          <div>
            <h3 style={{ marginBottom: "var(--space-md)" }}>
              No liked songs yet
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                maxWidth: "500px",
                margin: "0 auto",
                marginBottom: "var(--space-lg)",
              }}
            >
              Start exploring music and like songs to add them to your
              collection
            </p>

            <Button variant="primary" onClick={handleExplore}>
              Explore Music
            </Button>
          </div>
        </div>
      ) : (
        <MusicList title="Liked Songs" songs={likedSongs} />
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "inline-block" }}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function EmptyLikedIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-tertiary)" }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
