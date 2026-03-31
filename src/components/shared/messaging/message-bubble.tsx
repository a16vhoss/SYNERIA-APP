"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean;
  read: boolean;
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  content,
  timestamp,
  isSender,
  read,
}: MessageBubbleProps) {
  return (
    <motion.div
      className={cn("flex w-full", isSender ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, x: isSender ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isSender
            ? "rounded-br-md bg-brand-500 text-white"
            : "rounded-bl-md border border-white/30 bg-white/80 text-foreground backdrop-blur-sm dark:bg-white/10"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1",
            isSender ? "text-white/70" : "text-muted-foreground"
          )}
        >
          <span className="text-[10px]">{formatTime(timestamp)}</span>
          {isSender && (
            read ? (
              <CheckCheck className="size-3.5" />
            ) : (
              <Check className="size-3.5" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
