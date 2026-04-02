"use server";

import { createClient } from "@/lib/supabase/server";
import { createGroupSchema, groupPostSchema } from "@/lib/validations/groups";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  category: "sector" | "country" | "interest";
  creator_id: string;
  member_count: number;
  is_public: boolean;
  created_at: string;
  is_member?: boolean;
  user_role?: string | null;
}

export interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
    skills: string[];
  };
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
  };
}

export async function getGroups(filters?: {
  category?: string;
  search?: string;
}): Promise<Group[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("groups")
    .select("*")
    .order("member_count", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  if (!user) return data ?? [];

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user.id);

  const membershipMap = new Map(
    (memberships ?? []).map((m) => [m.group_id, m.role])
  );

  return (data ?? []).map((group) => ({
    ...group,
    is_member: membershipMap.has(group.id),
    user_role: membershipMap.get(group.id) ?? null,
  }));
}

export async function getGroupById(groupId: string): Promise<Group> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) throw new Error(error.message);

  let is_member = false;
  let user_role = null;

  if (user) {
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    is_member = !!membership;
    user_role = membership?.role ?? null;
  }

  return { ...data, is_member, user_role };
}

export async function createGroup(input: {
  name: string;
  description?: string;
  category: string;
  is_public?: boolean;
}): Promise<Group> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = createGroupSchema.parse(input);

  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: parsed.name,
      description: parsed.description ?? null,
      category: parsed.category,
      creator_id: user.id,
      is_public: parsed.is_public,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { ...data, is_member: true, user_role: "admin" };
}

export async function joinGroup(groupId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: user.id, role: "member" });

  if (error) throw new Error(error.message);
}

export async function leaveGroup(groupId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      *,
      profile:profiles(full_name, avatar_url, city, country)
    `)
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGroupPosts(
  groupId: string,
  cursor?: string
): Promise<{ posts: GroupPost[]; nextCursor: string | null }> {
  const supabase = await createClient();

  let query = supabase
    .from("group_posts")
    .select(`
      *,
      author:profiles!group_posts_author_id_fkey(full_name, avatar_url, skills)
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const posts = data ?? [];
  const nextCursor = posts.length === 20 ? posts[posts.length - 1].created_at : null;

  return { posts, nextCursor };
}

export async function createGroupPost(input: {
  group_id: string;
  content: string;
  media_urls?: string[];
}): Promise<GroupPost> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = groupPostSchema.parse(input);

  const { data, error } = await supabase
    .from("group_posts")
    .insert({
      group_id: input.group_id,
      author_id: user.id,
      content: parsed.content,
      media_urls: parsed.media_urls,
    })
    .select(`
      *,
      author:profiles!group_posts_author_id_fkey(full_name, avatar_url, skills)
    `)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteGroupPost(postId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_posts")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);
}
