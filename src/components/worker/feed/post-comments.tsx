"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getComments, addComment, type FeedItem } from "@/lib/actions/feed";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; full_name: string; avatar_url: string | null };
}

interface PostCommentsProps {
  postId: string;
  postType: FeedItem["type"];
}

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
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function PostComments({ postId, postType }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getComments(postId, postType)
      .then((data) => {
        if (mounted) setComments(data as Comment[]);
      })
      .catch(() => {
        if (mounted) toast.error("No se pudieron cargar los comentarios");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [postId, postType]);

  const handleSubmit = useCallback(async () => {
    const trimmed = newComment.trim();
    if (!trimmed || submitting) return;

    // Optimistic update
    const optimistic: Comment = {
      id: `local-${Date.now()}`,
      content: trimmed,
      created_at: new Date().toISOString(),
      author: { id: "me", full_name: "Tú", avatar_url: null },
    };
    setComments((prev) => [...prev, optimistic]);
    setNewComment("");
    setSubmitting(true);

    try {
      await addComment(postId, postType, trimmed);
    } catch (err) {
      // Revert optimistic
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setNewComment(trimmed);
      toast.error("No se pudo enviar el comentario");
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  }, [newComment, submitting, postId, postType]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-2">
              Sé el primero en comentar
            </p>
          ) : (
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage
                      src={comment.author.avatar_url ?? undefined}
                      alt={comment.author.full_name}
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-semibold">
                      {getInitials(comment.author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl rounded-tl-none bg-muted px-3 py-2">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {comment.author.full_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-brand-100 text-brand-700 text-[10px] font-semibold">
            Tú
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-muted/50 pl-3 pr-1 py-1">
          <Input
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comentario..."
            className="h-6 flex-1 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={500}
            aria-label="Escribe un comentario"
            disabled={submitting}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            className="size-7 shrink-0 rounded-full"
            aria-label="Enviar comentario"
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
