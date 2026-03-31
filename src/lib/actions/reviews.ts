"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  MockReview,
  PendingReview,
  ReviewTag,
} from "@/lib/constants/mock-data";

/* ------------------------------------------------------------------ */
/*  Create                                                             */
/* ------------------------------------------------------------------ */

export async function createReview(
  contractId: string,
  rating: number,
  comment: string,
  tags: ReviewTag[]
): Promise<{ success: boolean; reviewId: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, reviewId: "" };

    // Get contract to determine reviewee
    const { data: contract } = await supabase
      .from("contracts")
      .select("worker_id, employer_id, company_id")
      .eq("id", contractId)
      .single();

    if (!contract) return { success: false, reviewId: "" };

    const revieweeId = contract.worker_id === user.id ? contract.employer_id : contract.worker_id;

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        contract_id: contractId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        company_id: contract.company_id,
        rating,
        comment,
        tags: tags,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, reviewId: review.id };
  } catch {
    return { success: false, reviewId: "" };
  }
}

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

export async function getReviewsForUser(
  userId: string
): Promise<MockReview[]> {
  try {
    const supabase = await createClient();

    const { data: reviews } = await supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviewer_id(full_name)")
      .eq("reviewee_id", userId)
      .order("created_at", { ascending: false });

    if (!reviews?.length) return [];

    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;
    return reviews.map((r, i) => ({
      id: r.id,
      reviewerName: (r.reviewer as unknown as { full_name: string })?.full_name ?? "Usuario",
      reviewerLetter: ((r.reviewer as unknown as { full_name: string })?.full_name ?? "U").charAt(0),
      reviewerGradient: gradients[i % gradients.length],
      rating: r.rating,
      comment: r.comment ?? "",
      tags: (r.tags ?? []) as ReviewTag[],
      contractPosition: "",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getReviewsForCompany(
  companyId: string
): Promise<MockReview[]> {
  try {
    const supabase = await createClient();

    const { data: reviews } = await supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviewer_id(full_name)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (!reviews?.length) return [];

    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;
    return reviews.map((r, i) => ({
      id: r.id,
      reviewerName: (r.reviewer as unknown as { full_name: string })?.full_name ?? "Usuario",
      reviewerLetter: ((r.reviewer as unknown as { full_name: string })?.full_name ?? "U").charAt(0),
      reviewerGradient: gradients[i % gradients.length],
      rating: r.rating,
      comment: r.comment ?? "",
      tags: (r.tags ?? []) as ReviewTag[],
      contractPosition: "",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getPendingReviews(): Promise<PendingReview[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Find completed contracts where user hasn't reviewed yet
    const { data: contracts } = await supabase
      .from("contracts")
      .select("id, position, employer_name, worker_id, employer_id, company_id")
      .or(`worker_id.eq.${user.id},employer_id.eq.${user.id}`)
      .eq("status", "completado");

    if (!contracts?.length) return [];

    // Check which ones already have reviews from this user
    const contractIds = contracts.map((c) => c.id);
    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("contract_id")
      .eq("reviewer_id", user.id)
      .in("contract_id", contractIds);

    const reviewedIds = new Set(existingReviews?.map((r) => r.contract_id) ?? []);
    const pending = contracts.filter((c) => !reviewedIds.has(c.id));

    if (!pending.length) return [];

    return pending.map((c) => ({
      id: `pending-${c.id}`,
      contractId: c.id,
      contractPosition: c.position ?? "",
      counterpartyName: c.employer_name ?? "Empresa",
      counterpartyLetter: (c.employer_name ?? "E").charAt(0),
      counterpartyGradient: "blue" as const,
      completedAt: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}
