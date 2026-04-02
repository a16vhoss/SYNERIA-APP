"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { MockReview } from "@/lib/constants/mock-data";

interface TabReviewsProps {
  reviews: MockReview[];
}

const GRADIENT_COLORS: Record<string, string> = {
  green: "bg-emerald-700",
  orange: "bg-orange-600",
  purple: "bg-purple-700",
  blue: "bg-blue-700",
  red: "bg-red-700",
  teal: "bg-teal-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function TabReviews({ reviews }: TabReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Star className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Este usuario aún no tiene reseñas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => {
        const bgColor = GRADIENT_COLORS[review.reviewerGradient] ?? "bg-slate-700";

        return (
          <Card key={review.id} className="bg-card/60 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              {/* Reviewer row */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${bgColor}`}
                >
                  {review.reviewerLetter}
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-semibold text-foreground">
                    {review.reviewerName}
                  </span>
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}

              {/* Tags */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
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
