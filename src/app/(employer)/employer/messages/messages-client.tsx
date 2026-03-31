"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared";
import { GlassCard } from "@/components/shared";
import { ConversationList } from "@/components/shared/messaging/conversation-list";
import { ChatView } from "@/components/shared/messaging/chat-view";
import { useMessages } from "@/hooks/useMessages";
import type { Conversation } from "@/lib/actions/messages";

export function EmployerMessagesClient({ currentUserId }: { currentUserId?: string }) {
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    setActiveConversationId,
    sendMessage,
    markAsRead,
  } = useMessages();

  // Mobile: track whether we're viewing the chat or the list
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setActiveConversationId(conversation.id);
      setMobileShowChat(true);
      // Mark messages as read -- conversation.id is now the other user's id
      markAsRead(conversation.participantId);
    },
    [setActiveConversationId, markAsRead]
  );

  const handleBack = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (!activeConversation) return;
      sendMessage(activeConversation.participantId, content);
    },
    [activeConversation, sendMessage]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mensajes"
        subtitle="Gestiona la comunicacion con tus candidatos"
      />

      <GlassCard className="h-[calc(100vh-12rem)] overflow-hidden !p-0" hover={false}>
        <div className="flex h-full">
          {/* Left panel: conversation list */}
          <motion.div
            className={cn(
              "h-full w-full shrink-0 border-r border-white/20 md:w-[320px]",
              mobileShowChat ? "hidden md:block" : "block"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.id ?? null}
              onSelect={handleSelectConversation}
              loading={loading}
            />
          </motion.div>

          {/* Right panel: chat view */}
          <div
            className={cn(
              "h-full min-w-0 flex-1",
              !mobileShowChat ? "hidden md:block" : "block"
            )}
          >
            <ChatView
              conversation={activeConversation}
              messages={messages}
              currentUserId={currentUserId ?? ""}
              onSend={handleSend}
              onBack={handleBack}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
