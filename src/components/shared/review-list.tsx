"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageSquareOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/shared/review-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { MockReview } from "@/lib/constants/mock-data";

interface ReviewListProps {
  reviews: MockReview[];
  initialCount?: number;
  className?: string;
}

export function ReviewList({
  reviews,
  initialCount = 3,
  className,
}: ReviewListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, initialCount);
  const hasMore = reviews.length > initialCount;

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareOff}
        title="Sin resenas"
        description="Aun no hay resenas disponibles."
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <AnimatePresence initial={false}>
        {displayed.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </AnimatePresence>

      {hasMore && !showAll && (
        <motion.div
          className="flex justify-center pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Ver todas ({reviews.length})
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
