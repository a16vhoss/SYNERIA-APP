import { getPublicProfile, getConnectionStatus } from "@/lib/actions/network";
import { getPortfolioItems } from "@/lib/actions/portfolio";
import {
  getRecommendationsForUser,
  getRecommendationCount,
  hasRecommended,
} from "@/lib/actions/recommendations";
import { getReviewsForUser } from "@/lib/actions/reviews";
import { PublicProfileClient } from "./public-profile-client";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  try {
    const [
      profile,
      connectionStatus,
      portfolio,
      recommendations,
      recCount,
      reviews,
      alreadyRecommended,
    ] = await Promise.all([
      getPublicProfile(userId),
      getConnectionStatus(userId),
      getPortfolioItems(userId),
      getRecommendationsForUser(userId),
      getRecommendationCount(userId),
      getReviewsForUser(userId),
      hasRecommended(userId),
    ]);

    return (
      <PublicProfileClient
        profile={profile}
        connectionStatus={connectionStatus}
        portfolio={portfolio}
        recommendations={recommendations}
        recommendationCount={recCount}
        reviews={reviews}
        alreadyRecommended={alreadyRecommended}
      />
    );
  } catch {
    notFound();
  }
}
