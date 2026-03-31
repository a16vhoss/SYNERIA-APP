"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/lib/actions/messages";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => void;
  onBack?: () => void;
  className?: string;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDateSeparator(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupMessagesByDate(
  messages: Message[]
): { date: string; messages: Message[] }[] {
  const groups: Map<string, Message[]> = new Map();

  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toDateString();
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(msg);
    } else {
      groups.set(dateKey, [msg]);
    }
  }

  return Array.from(groups.entries()).map(([, msgs]) => ({
    date: msgs[0].createdAt,
    messages: msgs,
  }));
}

/* ── Component ───────────────────────────────────────────────────── */

export function ChatView({
  conversation,
  messages,
  currentUserId,
  onSend,
  onBack,
  className,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // No active conversation
  if (!conversation) {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center text-center",
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex size-20 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <MessageSquareText className="size-10" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Tus mensajes
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona una conversacion para comenzar
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 border-b border-white/20 bg-white/60 px-4 py-3 backdrop-blur-md dark:bg-white/5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {onBack && (
          <motion.button
            onClick={onBack}
            className="mr-1 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground md:hidden"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="size-5" />
          </motion.button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {getInitials(conversation.participantName)}
          </div>
          {conversation.online && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {conversation.participantName}
          </h3>
          <p className="text-xs text-muted-foreground">
            {conversation.online ? "En linea" : "Desconectado"}
          </p>
        </div>
      </motion.div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        <AnimatePresence initial={false}>
          {grouped.map((group) => (
            <div key={group.date} className="flex flex-col gap-2">
              {/* Date separator */}
              <motion.div
                className="flex items-center justify-center py-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-white/10">
                  {formatDateSeparator(group.date)}
                </span>
              </motion.div>

              {/* Messages */}
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  timestamp={msg.createdAt}
                  isSender={msg.senderId === currentUserId}
                  read={msg.read}
                />
              ))}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        placeholder={`Mensaje a ${conversation.participantName}...`}
      />
    </div>
  );
}
