"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";
import type { Recommendation } from "@/lib/actions/recommendations";

interface TabRecommendationsProps {
  recommendations: Recommendation[];
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

export function TabRecommendations({ recommendations }: TabRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ThumbsUp className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Este usuario aún no tiene recomendaciones.
        </p>
      </div>
    );
  }

  return (
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
  );
}
