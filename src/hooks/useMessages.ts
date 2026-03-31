"use client";

import { useState, useCallback, useEffect } from "react";
import type { Conversation, Message } from "@/lib/actions/messages";
import {
  getConversations as fetchConversations,
  getMessages as fetchMessages,
  sendMessage as sendMsg,
  markAsRead as markRead,
} from "@/lib/actions/messages";

interface UseMessagesReturn {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const CURRENT_USER_ID = "usr_001";

export function useMessages(): UseMessagesReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null;

  // Load conversations
  const refreshConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConversations(CURRENT_USER_ID);
      setConversations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function load() {
      const data = await fetchMessages(activeConversationId!);
      if (!cancelled) setMessages(data);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeConversationId]);

  // Initial load
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      const newMsg = await sendMsg(CURRENT_USER_ID, receiverId, content);
      setMessages((prev) => [...prev, newMsg]);

      // Refresh conversations to update last message
      const updated = await fetchConversations(CURRENT_USER_ID);
      setConversations(updated);
    },
    []
  );

  const handleMarkAsRead = useCallback(
    async (conversationId: string) => {
      const convMessages = messages.filter(
        (m) =>
          m.conversationId === conversationId &&
          m.senderId !== CURRENT_USER_ID &&
          !m.read
      );
      if (convMessages.length === 0) return;

      const ids = convMessages.map((m) => m.id);
      await markRead(ids);

      setMessages((prev) =>
        prev.map((m) => (ids.includes(m.id) ? { ...m, read: true } : m))
      );

      // Refresh conversations to update unread counts
      const updated = await fetchConversations(CURRENT_USER_ID);
      setConversations(updated);
    },
    [messages]
  );

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    setActiveConversationId,
    sendMessage,
    markAsRead: handleMarkAsRead,
    refreshConversations,
  };
}
