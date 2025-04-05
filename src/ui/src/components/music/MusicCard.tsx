"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MusicCardProps {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverImage: string;
  isLiked?: boolean;
  onLikeToggle?: (id: string, liked: boolean) => void;
}

export function MusicCard({
  id,
  title,
  artist,
  album,
  coverImage,
  isLiked = false,
  onLikeToggle,
}: MusicCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [isHovered, setIsHovered] = useState(false);

  const handleLikeClick = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    if (onLikeToggle) {
      onLikeToggle(id, newLikedState);
    }
  };

  return (
    <div 
      className="music-card bg-card rounded-xl shadow overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={coverImage}
          alt={`${title} by ${artist}`}
          className="w-full h-full object-cover"
        />
        <div className={cn(
          "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button
            aria-label="Play"
            className="bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center transition-transform duration-300 hover:scale-110"
            onClick={() => console.log(`Play ${title}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="overflow-hidden">
            <h3 className="font-medium text-lg text-card-foreground truncate">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
            {album && <p className="text-xs text-muted-foreground/70 truncate mt-1">{album}</p>}
          </div>
          <button
            className="flex-shrink-0 ml-2 mt-1"
            onClick={handleLikeClick}
            aria-label={liked ? "Unlike" : "Like"}
          >
            {liked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}