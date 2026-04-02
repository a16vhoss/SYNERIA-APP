"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHero } from "@/components/worker/public-profile/profile-hero";
import { ProfileActions } from "@/components/worker/public-profile/profile-actions";
import { ProfileStats } from "@/components/worker/public-profile/profile-stats";
import { TabPortfolio } from "@/components/worker/public-profile/tab-portfolio";
import { TabAbout } from "@/components/worker/public-profile/tab-about";
import { TabSkills } from "@/components/worker/public-profile/tab-skills";
import { TabRecommendations } from "@/components/worker/public-profile/tab-recommendations";
import { TabReviews } from "@/components/worker/public-profile/tab-reviews";
import type { PublicProfile } from "@/lib/actions/network";
import type { PortfolioItem } from "@/lib/actions/portfolio";
import type { Recommendation } from "@/lib/actions/recommendations";
import type { MockReview } from "@/lib/constants/mock-data";

interface PublicProfileClientProps {
  profile: PublicProfile;
  connectionStatus: {
    status: "none" | "pending_sent" | "pending_received" | "accepted" | "blocked";
    connectionId: string | null;
  };
  portfolio: PortfolioItem[];
  recommendations: Recommendation[];
  recommendationCount: number;
  reviews: MockReview[];
  alreadyRecommended: boolean;
}

export function PublicProfileClient({
  profile,
  connectionStatus,
  portfolio,
  recommendations,
  recommendationCount,
  reviews,
  alreadyRecommended,
}: PublicProfileClientProps) {
  const [activeTab, setActiveTab] = useState("portfolio");

  return (
    <div className="min-h-screen bg-background">
      <ProfileHero profile={profile} />

      <div className="mx-auto max-w-4xl px-4 pb-10">
        <ProfileActions
          userId={profile.id}
          connectionStatus={connectionStatus}
          alreadyRecommended={alreadyRecommended}
          profile={profile}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="portfolio" className="flex-1">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-1">
              Sobre mí
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex-1">
              Habilidades
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">
              Recomendaciones
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Reseñas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-6">
            <TabPortfolio items={portfolio} />
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <TabAbout profile={profile} />
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <TabSkills profile={profile} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <TabRecommendations recommendations={recommendations} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <TabReviews reviews={reviews} />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <ProfileStats
            profile={profile}
            portfolioCount={portfolio.length}
            recommendationCount={recommendationCount}
          />
        </div>
      </div>
    </div>
  );
}
