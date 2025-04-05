import { MusicCard } from "./MusicCard";
import { cn } from "@/lib/utils";

export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverImage: string;
  isLiked?: boolean;
}

interface MusicListProps {
  items: MusicItem[];
  onLikeToggle?: (id: string, liked: boolean) => void;
  className?: string;
}

export function MusicList({ items, onLikeToggle, className }: MusicListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-card/40 rounded-lg border border-border">
        <p className="text-muted-foreground">No music found.</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
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