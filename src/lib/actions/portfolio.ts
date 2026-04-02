"use server";

import { createClient } from "@/lib/supabase/server";
import { portfolioItemSchema, PORTFOLIO_LIMITS } from "@/lib/validations/portfolio";

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: "photo" | "video" | "document";
  file_url: string;
  thumbnail_url: string | null;
  file_size: number;
  duration: number | null;
  project_date: string | null;
  tags: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getPortfolioItems(userId: string): Promise<PortfolioItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPortfolioCounts(userId: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("type")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = { photo: 0, video: 0, document: 0 };
  for (const item of data ?? []) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }
  return counts;
}

export async function createPortfolioItem(input: {
  title: string;
  description?: string;
  type: "photo" | "video" | "document";
  file_url: string;
  thumbnail_url?: string;
  file_size: number;
  duration?: number;
  project_date?: string;
  tags?: string[];
}): Promise<PortfolioItem> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = portfolioItemSchema.parse(input);

  const counts = await getPortfolioCounts(user.id);
  const limit = PORTFOLIO_LIMITS[parsed.type];
  if (counts[parsed.type] >= limit.maxCount) {
    throw new Error(`Maximum ${limit.maxCount} ${parsed.type}s allowed`);
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description ?? null,
      type: parsed.type,
      file_url: input.file_url,
      thumbnail_url: input.thumbnail_url ?? null,
      file_size: input.file_size,
      duration: input.duration ?? null,
      project_date: parsed.project_date ?? null,
      tags: parsed.tags,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updatePortfolioItem(
  id: string,
  input: { title?: string; description?: string; tags?: string[]; sort_order?: number }
): Promise<PortfolioItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_items")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("file_url, thumbnail_url")
    .eq("id", id)
    .single();

  if (item?.file_url) {
    const path = new URL(item.file_url).pathname.split("/portfolio/")[1];
    if (path) {
      await supabase.storage.from("portfolio").remove([path]);
    }
  }

  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function uploadPortfolioFile(
  formData: FormData
): Promise<{ url: string; size: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const type = formData.get("type") as "photo" | "video" | "document";
  const limit = PORTFOLIO_LIMITS[type];

  if (file.size > limit.maxSize) {
    throw new Error(`File too large. Max ${limit.maxSize / (1024 * 1024)}MB`);
  }
  if (!(limit.mimeTypes as readonly string[]).includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}/${type}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("portfolio")
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from("portfolio")
    .getPublicUrl(fileName);

  return { url: publicUrl, size: file.size };
}
