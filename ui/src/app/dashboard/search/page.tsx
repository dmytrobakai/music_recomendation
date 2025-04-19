"use client";

import MusicList from "@/components/music/MusicList";
import SearchBar from "@/components/music/SearchBar";
import { Song } from "@/types/song";
import { useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError("");
    setSearchQuery(query);

    try {
      const response = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container slideUp"
      style={{ padding: "var(--space-xl) var(--space-md)" }}
    >
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Search Music</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Find songs by title or artist name
        </p>
      </header>

      <SearchBar onSearch={handleSearch} isLoading={loading} />

      {error && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-lg)",
            backgroundColor: "rgba(255, 0, 0, 0.05)",
            borderRadius: "var(--radius-lg)",
            color: "var(--error)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "var(--space-xl)" }}>
          <LoadingSpinner />
          <p
            style={{
              marginTop: "var(--space-md)",
              color: "var(--text-secondary)",
            }}
          >
            Searching...
          </p>
        </div>
      )}

      {!loading && hasSearched && (
        <div className="fadeIn">
          {searchResults.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "var(--space-xl)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
                border: "1px solid var(--border-color)",
              }}
            >
              <NoResultsIcon />
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginTop: "var(--space-md)",
                }}
              >
                No songs found matching <strong>"{searchQuery}"</strong>
              </p>
            </div>
          ) : (
            <MusicList
              title={`Search Results for "${searchQuery}"`}
              songs={searchResults}
            />
          )}
        </div>
      )}

      {!loading && !hasSearched && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-xxl)",
            color: "var(--text-secondary)",
            backgroundColor: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
          }}
        >
          <SearchIcon />
          <p style={{ marginTop: "var(--space-md)" }}>
            Enter a search term to find songs
          </p>
        </div>
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
        }}
      >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function NoResultsIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
