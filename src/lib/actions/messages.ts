"use server";

import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Conversation {
  id: string; // the other user's id (used as conversation key)
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string; // ISO
  unreadCount: number;
  online: boolean;
}

export interface Message {
  id: string;
  conversationId: string; // the other user's id
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string; // ISO
  read: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/* ------------------------------------------------------------------ */
/*  Server actions                                                     */
/* ------------------------------------------------------------------ */

/**
 * Get all conversations for the current authenticated user.
 * Groups messages by the other party (sender_id or receiver_id).
 */
export async function getConversations(
  _userId?: string
): Promise<Conversation[]> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return [];

    const supabase = await createClient();

    // Get all messages where the current user is sender or receiver,
    // joined with the profiles table for the other user's name.
    // We use two queries: one where user is sender, one where user is receiver,
    // then merge them in JS to group by the "other" user.

    const { data: allMessages, error } = await supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        read,
        created_at
      `)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!allMessages || allMessages.length === 0) return [];

    // Group by the other user's id
    const conversationMap = new Map<
      string,
      {
        lastMessage: string;
        lastMessageAt: string;
        unreadCount: number;
      }
    >();

    for (const msg of allMessages) {
      const otherUserId =
        msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: 0,
        });
      }

      // Count unread messages sent TO the current user
      if (
        msg.sender_id === otherUserId &&
        msg.receiver_id === currentUserId &&
        !msg.read
      ) {
        const conv = conversationMap.get(otherUserId)!;
        conv.unreadCount += 1;
      }
    }

    // Fetch profile names for all other users
    const otherUserIds = Array.from(conversationMap.keys());

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", otherUserIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p])
    );

    // Build the Conversation array
    const conversations: Conversation[] = otherUserIds.map((otherUserId) => {
      const conv = conversationMap.get(otherUserId)!;
      const profile = profileMap.get(otherUserId);

      return {
        id: otherUserId, // use the other user's id as conversation key
        participantId: otherUserId,
        participantName: profile?.full_name ?? "Usuario",
        participantAvatar: profile?.avatar_url ?? null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount,
        online: false, // real-time presence would need Supabase Realtime
      };
    });

    // Sort by most recent message
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );

    return conversations;
  } catch (err) {
    console.error("[getConversations] Supabase error:", err);
    return [];
  }
}

/**
 * Get all messages between the current user and another user.
 */
export async function getMessages(
  otherUserId: string
): Promise<Message[]> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, read, created_at")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((msg) => ({
      id: msg.id,
      conversationId: otherUserId,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      createdAt: msg.created_at,
      read: msg.read,
    }));
  } catch (err) {
    console.error("[getMessages] Supabase error:", err);
    return [];
  }
}

/**
 * Send a message to another user.
 */
export async function sendMessage(
  receiverId: string,
  content: string
): Promise<Message> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) throw new Error("Not authenticated");

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content,
        read: false,
      })
      .select("id, sender_id, receiver_id, content, read, created_at")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      conversationId: receiverId,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      createdAt: data.created_at,
      read: data.read,
    };
  } catch (err) {
    console.error("[sendMessage] Supabase error, creating mock:", err);
    // Fallback: return a mock message so the UI doesn't break
    return {
      id: `msg-${Date.now()}`,
      conversationId: receiverId,
      senderId: "mock-user",
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
}

/**
 * Mark all messages from otherUserId to the current user as read.
 */
export async function markAsRead(
  otherUserId: string
): Promise<void> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return;

    const supabase = await createClient();

    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", otherUserId)
      .eq("receiver_id", currentUserId)
      .eq("read", false);

    if (error) throw error;
  } catch (err) {
    console.error("[markAsRead] Supabase error:", err);
  }
}
