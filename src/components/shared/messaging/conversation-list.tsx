"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/actions/messages";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversation: Conversation) => void;
  loading?: boolean;
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

function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/* ── Stagger variants ────────────────────────────────────────────── */

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

/* ── Component ───────────────────────────────────────────────────── */

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  loading = false,
}: ConversationListProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-white/20 p-3">
        <div className="relative flex items-center overflow-hidden rounded-lg border border-input bg-card transition-all duration-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
          <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("messages.searchConversations")}
            className="h-9 w-full bg-transparent px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-white/40"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center px-6 py-16 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <MessageSquare className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {search
                ? tc("empty.noSearchResults")
                : t("messages.noConversations")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? tc("empty.noSearchResults")
                : t("messages.startConversation")}
            </p>
          </motion.div>
        ) : (
          <motion.ul
            className="flex flex-col gap-0.5 p-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filtered.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <motion.li
                    key={conversation.id}
                    variants={itemVariants}
                    layout
                    className="list-none"
                  >
                    <button
                      onClick={() => onSelect(conversation)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200",
                        isActive
                          ? "bg-brand-500/10 ring-1 ring-brand-500/20"
                          : "hover:bg-white/40 dark:hover:bg-white/5"
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={cn(
                            "flex size-11 items-center justify-center rounded-full text-sm font-semibold",
                            isActive
                              ? "bg-brand-500 text-white"
                              : "bg-brand-100 text-brand-700"
                          )}
                        >
                          {getInitials(conversation.participantName)}
                        </div>
                        {conversation.online && (
                          <motion.span
                            className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "truncate text-sm font-medium",
                              isActive ? "text-brand-700" : "text-foreground"
                            )}
                          >
                            {conversation.participantName}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatRelativeTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <motion.span
                              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 20,
                              }}
                            >
                              {conversation.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  );
}
