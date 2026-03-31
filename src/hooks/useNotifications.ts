"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MockNotification } from "@/lib/constants/mock-data";
import { createClient } from "@/lib/supabase/client";

interface UseNotificationsReturn {
  notifications: MockNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch notifications from Supabase
  useEffect(() => {
    async function fetchNotifications() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNotifications([]);
          return;
        }
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (data) {
          setNotifications(
            data.map((n: any) => ({
              id: n.id,
              type: n.type ?? "info",
              title: n.title ?? "",
              message: n.message ?? "",
              read: n.read ?? false,
              createdAt: n.created_at ?? new Date().toISOString(),
            }))
          );
        }
      } catch {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();

    // Poll every 30 seconds
    pollRef.current = setInterval(fetchNotifications, 30_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  };
}
