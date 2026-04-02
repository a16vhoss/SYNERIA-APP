"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getRecommendationsForUser,
  getRecommendationCount,
  type Recommendation,
} from "@/lib/actions/recommendations";

interface TabRecomendacionesProps {
  profileId: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  coworker: "Compañero de trabajo",
  same_project: "Mismo proyecto",
  same_sector: "Mismo sector",
  acquaintance: "Conocido",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

export function TabRecomendaciones({ profileId }: TabRecomendacionesProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [recs, cnt] = await Promise.all([
          getRecommendationsForUser(profileId),
          getRecommendationCount(profileId),
        ]);
        setRecommendations(recs);
        setCount(cnt);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar recomendaciones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Star className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Aún no tienes recomendaciones.</p>
        <p className="text-sm text-muted-foreground/70">
          Conecta con otros profesionales para que puedan recomendarte.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Count header */}
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-brand-500" />
        <span className="text-sm font-medium text-muted-foreground">
          {count} {count === 1 ? "recomendación recibida" : "recomendaciones recibidas"}
        </span>
      </div>

      {/* Recommendations list */}
      <div className="flex flex-col gap-4">
        {recommendations.map((rec) => {
          const authorName = rec.author?.full_name ?? "Usuario";
          const initials = authorName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <Card key={rec.id} className="bg-card/60 backdrop-blur-sm">
              <CardContent className="flex flex-col gap-4 p-5">
                {/* Author row */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={rec.author?.avatar_url ?? undefined}
                      alt={authorName}
                    />
                    <AvatarFallback className="bg-indigo-700 text-sm font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="font-semibold text-foreground">{authorName}</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {RELATIONSHIP_LABELS[rec.relationship] ?? rec.relationship}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(rec.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <blockquote className="border-l-2 border-indigo-500/50 pl-3 text-sm italic text-muted-foreground">
                  &ldquo;{rec.content}&rdquo;
                </blockquote>

                {/* Highlighted skills */}
                {rec.highlighted_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.highlighted_skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-indigo-500/20 text-xs text-indigo-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
