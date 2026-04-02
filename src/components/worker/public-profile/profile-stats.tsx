"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Briefcase, Image, Users } from "lucide-react";
import type { PublicProfile } from "@/lib/actions/network";

interface ProfileStatsProps {
  profile: PublicProfile;
  portfolioCount: number;
  recommendationCount: number;
}

export function ProfileStats({
  profile,
  portfolioCount,
  recommendationCount,
}: ProfileStatsProps) {
  const stats = [
    {
      icon: Star,
      label: "Valoración",
      value: profile.rating != null ? profile.rating.toFixed(1) : "—",
      color: "text-yellow-400",
    },
    {
      icon: Briefcase,
      label: "Trabajos",
      value: profile.jobs_completed,
      color: "text-blue-400",
    },
    {
      icon: Image,
      label: "Portfolio",
      value: portfolioCount,
      color: "text-purple-400",
    },
    {
      icon: Users,
      label: "Recomendaciones",
      value: recommendationCount,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <Card key={label} className="bg-card/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-2 py-5">
            <Icon className={`h-6 w-6 ${color}`} />
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
