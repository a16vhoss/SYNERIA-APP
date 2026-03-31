"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import type { MockReview } from "@/lib/constants/mock-data";

function getRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 dia";
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} anos`;
}

interface ReviewCardProps {
  review: MockReview;
  index?: number;
  className?: string;
}

export function ReviewCard({ review, index = 0, className }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLongComment = review.comment.length > 150;
  const displayComment =
    !expanded && isLongComment
      ? review.comment.slice(0, 150) + "..."
      : review.comment;

  return (
    <motion.div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-white/15 bg-white/50 p-4 backdrop-blur-sm",
        "dark:border-white/8 dark:bg-white/5",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.06,
      }}
    >
      {/* Header: avatar + name + stars + date */}
      <div className="flex items-center gap-3">
        <CompanyAvatar
          letter={review.reviewerLetter}
          gradient={review.reviewerGradient}
          size="sm"
        />
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {review.reviewerName}
            </span>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {review.contractPosition}
          </span>
        </div>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {getRelativeDate(review.createdAt)}
        </span>
      </div>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {displayComment}
          </p>
          {isLongComment && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-medium text-brand-600 hover:underline"
            >
              {expanded ? "Leer menos" : "Leer mas"}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
