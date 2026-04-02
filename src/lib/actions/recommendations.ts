"use server";

import { createClient } from "@/lib/supabase/server";
import { recommendationSchema } from "@/lib/validations/recommendations";

export interface Recommendation {
  id: string;
  author_id: string;
  recipient_id: string;
  relationship: "coworker" | "same_project" | "same_sector" | "acquaintance";
  content: string;
  highlighted_skills: string[];
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
    skills: string[];
    city: string | null;
    country: string | null;
  };
}

export async function getRecommendationsForUser(userId: string): Promise<Recommendation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recommendations")
    .select(`
      *,
      author:profiles!recommendations_author_id_fkey(full_name, avatar_url, skills, city, country)
    `)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecommendationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createRecommendation(input: {
  recipient_id: string;
  relationship: string;
  content: string;
  highlighted_skills?: string[];
}): Promise<Recommendation> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = recommendationSchema.parse(input);

  const { data, error } = await supabase
    .from("recommendations")
    .insert({
      author_id: user.id,
      recipient_id: parsed.recipient_id,
      relationship: parsed.relationship,
      content: parsed.content,
      highlighted_skills: parsed.highlighted_skills,
    })
    .select(`
      *,
      author:profiles!recommendations_author_id_fkey(full_name, avatar_url, skills, city, country)
    `)
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("You already recommended this user");
    throw new Error(error.message);
  }
  return data;
}

export async function deleteRecommendation(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recommendations")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function hasRecommended(recipientId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id)
    .eq("recipient_id", recipientId);

  return (count ?? 0) > 0;
}
