"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationBellProps {
  unreadCount: number;
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

export function NotificationBell({
  unreadCount,
  notifications,
  onMarkRead,
  onMarkAllRead,
  className,
}: NotificationBellProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Bell button */}
      <motion.button
        className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        animate={
          unreadCount > 0
            ? {
                rotate: [0, -12, 12, -8, 8, -4, 0],
              }
            : {}
        }
        transition={{ duration: 0.6 }}
        key={unreadCount}
        aria-label={`${t("nav.notifications")}${unreadCount > 0 ? ` (${unreadCount} ${t("notifications.unread")})` : ""}`}
      >
        <Bell className="size-5" />

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl bg-popover shadow-lg ring-1 ring-foreground/10"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="font-heading text-sm font-semibold">
                {t("nav.notifications")}
              </h4>
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  className="text-xs font-medium text-brand-600 hover:underline"
                  onClick={onMarkAllRead}
                >
                  {t("notifications.markAllRead")}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("empty.noNotifications")}
                </div>
              ) : (
                notifications.map((notification, i) => (
                  <motion.div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 border-b px-4 py-3 transition-colors last:border-b-0",
                      !notification.read && "bg-brand-50/50"
                    )}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 flex shrink-0">
                      {!notification.read ? (
                        <span className="size-2 rounded-full bg-brand-500" />
                      ) : (
                        <span className="size-2" />
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {notification.title}
                      </p>
                      {notification.description && (
                        <p className="text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground/70">
                        {notification.timestamp}
                      </p>
                    </div>

                    {!notification.read && onMarkRead && (
                      <button
                        onClick={() => onMarkRead(notification.id)}
                        className="mt-1 shrink-0 text-muted-foreground hover:text-brand-600"
                        aria-label={t("notifications.markAsRead")}
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
