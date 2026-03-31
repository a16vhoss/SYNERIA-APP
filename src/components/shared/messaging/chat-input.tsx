"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Escribe un mensaje...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex items-end gap-2 border-t border-white/20 bg-white/60 p-3 backdrop-blur-md dark:bg-white/5">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none",
          "placeholder:text-muted-foreground",
          "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
          "transition-all duration-200",
          "max-h-[120px]"
        )}
      />
      <motion.button
        onClick={handleSend}
        disabled={!canSend}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          canSend
            ? "bg-brand-500 text-white hover:bg-brand-600"
            : "bg-muted text-muted-foreground"
        )}
        whileHover={canSend ? { scale: 1.08 } : undefined}
        whileTap={canSend ? { scale: 0.92 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <SendHorizontal className="size-5" />
      </motion.button>
    </div>
  );
}
