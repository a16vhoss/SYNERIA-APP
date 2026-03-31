"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MockNotification } from "@/lib/constants/mock-data";
import { MOCK_NOTIFICATIONS } from "@/lib/constants/mock-data";

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

  // Initial fetch (mock)
  useEffect(() => {
    async function fetchNotifications() {
      setIsLoading(true);
      try {
        // In production: fetch from Supabase
        // const { data } = await supabase.from('notifications').select('*').eq('user_id', userId)
        await new Promise((r) => setTimeout(r, 300)); // simulate latency
        setNotifications([...MOCK_NOTIFICATIONS]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();

    // Poll every 30 seconds (will replace with Supabase Realtime later)
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
