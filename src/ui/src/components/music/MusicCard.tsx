"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./css/MusicCard.module.css";

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
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <img
          src={coverImage}
          alt={`${title} by ${artist}`}
          className={styles.image}
        />
        <div className={cn(
          styles.overlay,
          isHovered ? styles.overlay : null
        )}>
          <button
            aria-label="Play"
            className={styles.playButton}
            onClick={() => console.log(`Play ${title}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.info}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.artist}>{artist}</p>
            {album && <p className={styles.album}>{album}</p>}
          </div>
          <button
            className={styles.likeButton}
            onClick={handleLikeClick}
            aria-label={liked ? "Unlike" : "Like"}
          >
            {liked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.likedIcon}
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
                className={styles.unlikedIcon}
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