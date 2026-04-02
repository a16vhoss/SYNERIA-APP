"use server";

import { createClient } from "@/lib/supabase/server";

export interface FeedItem {
  id: string;
  type: "activity" | "portfolio" | "recommendation" | "group_post";
  content: string;
  media_urls: string[];
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  author_title: string | null;
  group_name: string | null;
  group_id: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  has_liked: boolean;
}

export async function getFeedItems(filters?: {
  type?: "all" | "connections" | "groups" | "tips";
  cursor?: string;
}): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const cursor = filters?.cursor;
  const filterType = filters?.type ?? "all";
  const limit = 20;

  const { data: connections } = await supabase
    .from("connections")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  const connectionIds = new Set<string>();
  connectionIds.add(user.id);
  for (const c of connections ?? []) {
    connectionIds.add(c.requester_id === user.id ? c.addressee_id : c.requester_id);
  }
  const connArray = Array.from(connectionIds);

  const { data: myGroups } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);
  const groupIds = (myGroups ?? []).map((g) => g.group_id);

  const items: FeedItem[] = [];

  if (filterType === "all" || filterType === "connections" || filterType === "tips") {
    let query = supabase
      .from("network_activity")
      .select(`
        id, activity_type, content, visibility, created_at,
        user:profiles!network_activity_user_id_fkey(id, full_name, avatar_url, skills)
      `)
      .in("user_id", connArray)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filterType === "tips") {
      query = query.eq("activity_type", "tip");
    }
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data } = await query;
    for (const item of data ?? []) {
      const profile = item.user as any;
      items.push({
        id: item.id,
        type: "activity",
        content: item.content ?? "",
        media_urls: [],
        author_id: profile?.id ?? "",
        author_name: profile?.full_name ?? "Unknown",
        author_avatar: profile?.avatar_url ?? null,
        author_title: (profile?.skills ?? [])[0] ?? null,
        group_name: null,
        group_id: null,
        likes_count: 0,
        comments_count: 0,
        created_at: item.created_at,
        has_liked: false,
      });
    }
  }

  if (filterType === "all" || filterType === "connections") {
    let query = supabase
      .from("portfolio_items")
      .select(`
        id, title, description, type, file_url, thumbnail_url, created_at,
        user:profiles!portfolio_items_user_id_fkey(id, full_name, avatar_url, skills)
      `)
      .in("user_id", connArray)
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data } = await query;
    for (const item of data ?? []) {
      const profile = item.user as any;
      items.push({
        id: item.id,
        type: "portfolio",
        content: item.title + (item.description ? `: ${item.description}` : ""),
        media_urls: item.file_url ? [item.file_url] : [],
        author_id: profile?.id ?? "",
        author_name: profile?.full_name ?? "Unknown",
        author_avatar: profile?.avatar_url ?? null,
        author_title: (profile?.skills ?? [])[0] ?? null,
        group_name: null,
        group_id: null,
        likes_count: 0,
        comments_count: 0,
        created_at: item.created_at,
        has_liked: false,
      });
    }
  }

  if ((filterType === "all" || filterType === "groups") && groupIds.length > 0) {
    let query = supabase
      .from("group_posts")
      .select(`
        id, group_id, content, media_urls, likes_count, comments_count, created_at,
        author:profiles!group_posts_author_id_fkey(id, full_name, avatar_url, skills),
        group:groups!group_posts_group_id_fkey(name)
      `)
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data } = await query;
    for (const item of data ?? []) {
      const profile = item.author as any;
      const group = item.group as any;
      items.push({
        id: item.id,
        type: "group_post",
        content: item.content,
        media_urls: item.media_urls ?? [],
        author_id: profile?.id ?? "",
        author_name: profile?.full_name ?? "Unknown",
        author_avatar: profile?.avatar_url ?? null,
        author_title: (profile?.skills ?? [])[0] ?? null,
        group_name: group?.name ?? null,
        group_id: item.group_id,
        likes_count: item.likes_count,
        comments_count: item.comments_count,
        created_at: item.created_at,
        has_liked: false,
      });
    }
  }

  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const trimmed = items.slice(0, limit);
  const nextCursor = trimmed.length === limit ? trimmed[trimmed.length - 1].created_at : null;

  if (trimmed.length > 0) {
    const postIds = trimmed.map((i) => i.id);
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    const likedSet = new Set((likes ?? []).map((l) => l.post_id));
    for (const item of trimmed) {
      item.has_liked = likedSet.has(item.id);
    }
  }

  return { items: trimmed, nextCursor };
}

export async function toggleLike(postId: string, postType: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("post_likes")
    .select("*")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", postId);
    return false;
  } else {
    await supabase.from("post_likes").insert({ user_id: user.id, post_id: postId, post_type: postType });
    return true;
  }
}

export async function getComments(postId: string, postType: string): Promise<{
  id: string;
  content: string;
  created_at: string;
  author: { id: string; full_name: string; avatar_url: string | null };
}[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_comments")
    .select(`
      id, content, created_at,
      author:profiles!post_comments_author_id_fkey(id, full_name, avatar_url)
    `)
    .eq("post_id", postId)
    .eq("post_type", postType)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addComment(postId: string, postType: string, content: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!content.trim() || content.length > 500) {
    throw new Error("Comment must be 1-500 characters");
  }

  const { error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      post_type: postType,
      author_id: user.id,
      content: content.trim(),
    });

  if (error) throw new Error(error.message);
}
