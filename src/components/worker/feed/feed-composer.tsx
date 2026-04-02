"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, Lightbulb, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FeedItem } from "@/lib/actions/feed";

interface FeedComposerProps {
  onPost?: (item: FeedItem) => void;
}

export function FeedComposer({ onPost }: FeedComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleExpand() {
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleCancel() {
    setExpanded(false);
    setContent("");
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return;
    setSubmitting(true);

    // Optimistic: create a local FeedItem
    const optimisticItem: FeedItem = {
      id: `local-${Date.now()}`,
      type: "activity",
      content: content.trim(),
      media_urls: [],
      author_id: "me",
      author_name: "Tú",
      author_avatar: null,
      author_title: null,
      group_name: null,
      group_id: null,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      has_liked: false,
    };

    onPost?.(optimisticItem);
    setContent("");
    setExpanded(false);
    setSubmitting(false);
  }

  return (
    <Card className="overflow-hidden ring-1 ring-foreground/10">
      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {!expanded ? (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleExpand}
              className="flex w-full items-center gap-3 text-left"
              type="button"
            >
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                  Tú
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
                Comparte un consejo...
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                    Tú
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Tu publicación</p>
                  <p className="text-xs text-muted-foreground">Visible para tus conexiones</p>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Cancelar"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué consejo quieres compartir con tu red?"
                className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                maxLength={500}
              />

              {/* Character count */}
              <div className="text-right text-xs text-muted-foreground">
                {content.length}/500
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Agregar foto"
                  >
                    <Image className="size-4" />
                    Foto
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Agregar video"
                  >
                    <Video className="size-4" />
                    Video
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Compartir consejo"
                  >
                    <Lightbulb className="size-4" />
                    Consejo
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="h-8 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting}
                    className="h-8 text-xs"
                  >
                    {submitting ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
