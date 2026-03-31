"use server";

import {
  MOCK_REVIEWS,
  MOCK_PENDING_REVIEWS,
  type MockReview,
  type PendingReview,
  type ReviewTag,
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
  void contractId;
  void rating;
  void comment;
  void tags;
  return { success: true, reviewId: `rev_${Date.now()}` };
}

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

export async function getReviewsForUser(
  userId: string
): Promise<MockReview[]> {
  void userId;
  // Return mock reviews for any user
  return MOCK_REVIEWS;
}

export async function getReviewsForCompany(
  companyId: string
): Promise<MockReview[]> {
  void companyId;
  return MOCK_REVIEWS.filter(
    (r) => r.reviewerGradient === "green" || r.reviewerGradient === "orange"
  );
}

export async function getPendingReviews(): Promise<PendingReview[]> {
  return MOCK_PENDING_REVIEWS;
}
