"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="Search for songs, artists, or albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-r-none pr-10"
          disabled={loading}
          aria-label="Search query"
        />
      </div>
      <Button 
        type="submit" 
        className="rounded-l-none" 
        disabled={loading || !query.trim()}
        aria-label="Search"
      >
        {loading ? (
          <span className="inline-block animate-spin mr-2">⟳</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
        <span className="ml-2 hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}