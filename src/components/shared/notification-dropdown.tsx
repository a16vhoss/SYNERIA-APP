"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Briefcase,
  CalendarCheck,
  MessageCircle,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockNotification } from "@/lib/constants/mock-data";

const TYPE_CONFIG: Record<
  MockNotification["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  application: {
    icon: Briefcase,
    color: "text-brand-600",
    bg: "bg-brand-100",
  },
  interview: {
    icon: CalendarCheck,
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
  message: {
    icon: MessageCircle,
    color: "text-sky-600",
    bg: "bg-sky-100",
  },
  system: {
    icon: Settings,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
};

interface NotificationDropdownProps {
  notifications: MockNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll?: () => void;
  className?: string;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  className,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Bell button */}
      <motion.button
        className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        animate={
          unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, -4, 0] } : {}
        }
        transition={{ duration: 0.6 }}
        key={unreadCount}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      >
        <Bell className="size-5" />

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
                Notificaciones
              </h4>
              {unreadCount > 0 && (
                <button
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                  onClick={onMarkAllAsRead}
                >
                  <CheckCheck className="size-3" />
                  Marcar todo como leido
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center gap-2 py-10 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Bell className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sin notificaciones
                  </p>
                </motion.div>
              ) : (
                recentNotifications.map((notification, i) => {
                  const typeConfig = TYPE_CONFIG[notification.type];
                  const TypeIcon = typeConfig.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 border-b px-4 py-3 transition-colors last:border-b-0 cursor-pointer hover:bg-muted/30",
                        !notification.read && "bg-brand-50/40"
                      )}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        if (!notification.read) onMarkAsRead(notification.id);
                      }}
                    >
                      {/* Type icon */}
                      <div
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          typeConfig.bg
                        )}
                      >
                        <TypeIcon className={cn("size-4", typeConfig.color)} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm leading-snug",
                              !notification.read
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70">
                          {notification.time}
                        </p>
                      </div>

                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          className="mt-1 shrink-0 text-muted-foreground hover:text-brand-600"
                          aria-label="Marcar como leida"
                        >
                          <Check className="size-4" />
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && onViewAll && (
              <div className="border-t">
                <button
                  className="flex w-full items-center justify-center gap-1 py-2.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50/50"
                  onClick={() => {
                    onViewAll();
                    setOpen(false);
                  }}
                >
                  Ver todas
                  <ChevronRight className="size-3" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
