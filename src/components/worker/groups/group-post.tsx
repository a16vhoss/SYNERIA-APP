"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GroupPost } from "@/lib/actions/groups";
import { cn } from "@/lib/utils";

interface GroupPostCardProps {
  post: GroupPost;
}

export function GroupPostCard({ post }: GroupPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const author = post.author;
  const initials = author?.full_name
    ? author.full_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const formattedDate = new Date(post.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleLike() {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-white/20 bg-white/60 p-5 backdrop-blur-md",
        "shadow-[var(--shadow-card)] dark:border-white/10 dark:bg-white/5"
      )}
    >
      {/* Author row */}
      <div className="flex items-center gap-3">
        {author?.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.full_name}
            className="size-10 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white ring-2 ring-border">
            {initials}
          </div>
        )}
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">
            {author?.full_name ?? "Usuario"}
          </span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div
          className={cn(
            "grid gap-2 overflow-hidden rounded-lg",
            post.media_urls.length === 1
              ? "grid-cols-1"
              : post.media_urls.length === 2
              ? "grid-cols-2"
              : "grid-cols-2"
          )}
        >
          {post.media_urls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative aspect-video bg-muted">
              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={url}
                  alt={`Media ${i + 1}`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-6" />
                </div>
              )}
              {i === 3 && post.media_urls.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-medium">
                  +{post.media_urls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-border pt-2">
        <motion.div whileTap={{ scale: 0.85 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "gap-1.5 text-xs",
              liked ? "text-red-500 hover:text-red-500" : "text-muted-foreground"
            )}
          >
            <Heart
              className={cn("size-4", liked && "fill-red-500 text-red-500")}
            />
            {likesCount > 0 && <span>{likesCount}</span>}
            Me gusta
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <MessageSquare className="size-4" />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
          Comentar
        </Button>
      </div>
    </div>
  );
}
