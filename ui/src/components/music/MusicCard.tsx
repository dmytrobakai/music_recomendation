import React, { useState } from "react";

interface Song {
  id: number;
  title: string;
  artist_name: string;
  album_cover: string;
  artist_id: number; // додано поле
}

interface MusicCardProps {
  song: Song;
  isLiked: boolean;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  onDeleteArtist: (artistId: number) => void; // новий пропс
}

const MusicCard: React.FC<MusicCardProps> = ({
  song,
  isLiked,
  onLike,
  onUnlike,
  onDeleteArtist,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLikeToggle = async () => {
    setIsLoading(true);
    try {
      if (isLiked) {
        await onUnlike(song.id);
      } else {
        await onLike(song.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete artist ${song.artist_name} and all their songs?`
      )
    ) {
      onDeleteArtist(song.artist_id);
    }
  };

  return (
    <div
      className="slideUp"
      style={{
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition:
          "transform var(--transition-default), box-shadow var(--transition-default)",
        transform: isHovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: isHovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        border: "1px solid var(--border-color)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          height: "160px",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src={song.album_cover}
          alt={`${song.title} cover`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div
        style={{
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <h3
          style={{
            marginBottom: "var(--space-xs)",
            fontSize: "1.125rem",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.title}
        </h3>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            marginBottom: "var(--space-md)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {song.artist_name}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <button
            onClick={handleLikeToggle}
            disabled={isLoading}
            aria-label={isLiked ? "Unlike song" : "Like song"}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: isLiked ? "var(--primary-color)" : "var(--text-secondary)",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-sm)",
              borderRadius: "var(--radius-pill)",
              transition: "all var(--transition-fast)",
              opacity: isHovered || isLiked ? 1 : 0.7,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke={isLiked ? "none" : "currentColor"}
              fill={isLiked ? "var(--primary-color)" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            style={{
              fontSize: "0.8rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Delete Artist
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
