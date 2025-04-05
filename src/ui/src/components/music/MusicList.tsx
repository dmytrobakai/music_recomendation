import { MusicCard } from "./MusicCard";
import { cn } from "@/lib/utils";
import { MusicItem } from "@/lib/api";
import styles from "./css/MusicList.module.css";

interface MusicListProps {
  items: MusicItem[];
  onLikeToggle?: (id: string, liked: boolean) => void;
  className?: string;
}

export function MusicList({ items, onLikeToggle, className }: MusicListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No music found.</p>
      </div>
    );
  }

  return (
    <div className={cn(styles.grid, className)}>
      {items.map((item) => (
        <MusicCard
          key={item.id}
          id={item.id}
          title={item.title}
          artist={item.artist}
          album={item.album}
          coverImage={item.coverImage}
          isLiked={item.isLiked}
          onLikeToggle={onLikeToggle}
        />
      ))}
    </div>
  );
}