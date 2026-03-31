"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import type { MockReview } from "@/lib/constants/mock-data";

interface ReviewSummaryProps {
  reviews: MockReview[];
  compact?: boolean;
  className?: string;
}

export function ReviewSummary({
  reviews,
  compact = false,
  className,
}: ReviewSummaryProps) {
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  /* -- Compact mode ------------------------------------------------ */
  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <StarRating rating={avgRating} size="sm" />
        <span className="text-sm font-semibold text-foreground">
          {avgRating.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          ({reviews.length} resenas)
        </span>
      </div>
    );
  }

  /* -- Full mode --------------------------------------------------- */
  return (
    <motion.div
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-white/15 bg-white/50 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-8",
        "dark:border-white/8 dark:bg-white/5",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Left: big number + stars */}
      <div className="flex flex-col items-center gap-1.5">
        <AnimatedRatingNumber target={avgRating} />
        <StarRating rating={avgRating} size="md" />
        <span className="text-xs text-muted-foreground">
          {reviews.length} resenas
        </span>
      </div>

      {/* Right: bar chart */}
      <div className="flex flex-1 flex-col gap-2">
        {distribution.map((row) => (
          <div key={row.star} className="flex items-center gap-2">
            <span className="w-4 text-right text-xs font-medium text-muted-foreground">
              {row.star}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <AnimatedBar percentage={row.percentage} star={row.star} />
            </div>
            <span className="w-6 text-right text-[11px] text-muted-foreground">
              {row.count}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated rating number                                             */
/* ------------------------------------------------------------------ */

function AnimatedRatingNumber({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
    duration: 1500,
  });
  const displayed = useTransform(springValue, (v) => v.toFixed(1));

  useEffect(() => {
    if (isInView) {
      motionValue.set(target);
    }
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsubscribe = displayed.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
    return unsubscribe;
  }, [displayed]);

  return (
    <motion.span
      ref={ref}
      className="font-heading text-4xl font-bold tracking-tight text-foreground"
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      0.0
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated bar                                                       */
/* ------------------------------------------------------------------ */

function AnimatedBar({
  percentage,
  star,
}: {
  percentage: number;
  star: number;
}) {
  return (
    <motion.div
      className="absolute inset-y-0 left-0 rounded-full bg-amber-400"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: (6 - star) * 0.1,
      }}
    />
  );
}
