"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostComments } from "@/components/worker/feed/post-comments";
import { toggleLike, type FeedItem } from "@/lib/actions/feed";
import { cn } from "@/lib/utils";

interface FeedPostProps {
  item: FeedItem;
}

const TYPE_CONFIG: Record<
  FeedItem["type"],
  { label: string; className: string }
> = {
  activity: {
    label: "Post",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  portfolio: {
    label: "Portfolio",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  recommendation: {
    label: "Recomendación",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  group_post: {
    label: "Grupo",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function FeedPost({ item }: FeedPostProps) {
  const [liked, setLiked] = useState(item.has_liked);
  const [likesCount, setLikesCount] = useState(item.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const typeConfig = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.activity;
  const initials = getInitials(item.author_name);
  const isLocalPost = item.id.startsWith("local-");

  const handleLike = useCallback(async () => {
    if (isLocalPost || likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      await toggleLike(item.id, item.type);
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
      toast.error("No se pudo registrar el me gusta");
    } finally {
      setLikeLoading(false);
    }
  }, [isLocalPost, likeLoading, liked, item.id, item.type]);

  const handleShare = useCallback(async () => {
    if (isLocalPost) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/network/feed#${item.id}`
      );
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }, [isLocalPost, item.id]);

  return (
    <Card className="overflow-hidden ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link
            href={isLocalPost ? "#" : `/workers/${item.author_id}`}
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            tabIndex={isLocalPost ? -1 : 0}
          >
            <Avatar className="size-10">
              <AvatarImage src={item.author_avatar ?? undefined} alt={item.author_name} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={isLocalPost ? "#" : `/workers/${item.author_id}`}
                className="text-sm font-semibold text-foreground hover:underline underline-offset-2"
                tabIndex={isLocalPost ? -1 : 0}
              >
                {item.author_name}
              </Link>
              {item.group_name && (
                <>
                  <span className="text-xs text-muted-foreground">en</span>
                  <span className="text-xs font-medium text-brand-700">
                    {item.group_name}
                  </span>
                </>
              )}
              <Badge
                variant="outline"
                className={cn(
                  "ml-auto text-[10px] px-2 py-0.5 h-5 border font-medium",
                  typeConfig.className
                )}
              >
                {typeConfig.label}
              </Badge>
            </div>
            {item.author_title && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {item.author_title}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeTime(item.created_at)}
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="mt-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {item.content}
        </p>

        {/* Media thumbnails */}
        {item.media_urls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {item.media_urls.slice(0, 3).map((url, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Media ${i + 1}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
                {i === 2 && item.media_urls.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-semibold">
                    +{item.media_urls.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
          <motion.div whileTap={{ scale: 0.92 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLocalPost || likeLoading}
              className={cn(
                "h-8 gap-1.5 px-3 text-xs font-medium transition-colors",
                liked
                  ? "text-brand-700 hover:text-brand-800"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={liked ? "Quitar me gusta" : "Me gusta"}
              aria-pressed={liked}
            >
              <ThumbsUp
                className={cn("size-3.5", liked && "fill-current")}
              />
              {likesCount > 0 && <span>{likesCount}</span>}
              <span className="hidden sm:inline">Me gusta</span>
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            disabled={isLocalPost}
            className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-label="Ver comentarios"
            aria-expanded={showComments}
          >
            <MessageSquare className="size-3.5" />
            {item.comments_count > 0 && <span>{item.comments_count}</span>}
            <span className="hidden sm:inline">Comentar</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isLocalPost}
            className="h-8 gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-label="Compartir publicación"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
        </div>

        {/* Comments section */}
        {showComments && !isLocalPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <PostComments postId={item.id} postType={item.type} />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
