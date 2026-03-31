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
      const data = await fetchConversations();
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
      // activeConversationId is now the other user's id
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
      const newMsg = await sendMsg(receiverId, content);
      setMessages((prev) => [...prev, newMsg]);

      // Refresh conversations to update last message
      const updated = await fetchConversations();
      setConversations(updated);
    },
    []
  );

  const handleMarkAsRead = useCallback(
    async (conversationId: string) => {
      // conversationId is now the other user's id (participantId)
      await markRead(conversationId);

      // Optimistically mark local messages as read
      setMessages((prev) =>
        prev.map((m) =>
          m.conversationId === conversationId && !m.read
            ? { ...m, read: true }
            : m
        )
      );

      // Refresh conversations to update unread counts
      const updated = await fetchConversations();
      setConversations(updated);
    },
    []
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
