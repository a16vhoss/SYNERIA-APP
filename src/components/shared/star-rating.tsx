"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
} as const;

interface StarRatingProps {
  rating?: number;
  interactive?: boolean;
  value?: number;
  onChange?: (rating: number) => void;
  size?: keyof typeof sizeMap;
  showValue?: boolean;
  maxStars?: number;
  className?: string;
}

export function StarRating({
  rating: displayRating,
  interactive = false,
  value,
  onChange,
  size = "md",
  showValue = false,
  maxStars = 5,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const currentRating = interactive ? (value ?? 0) : (displayRating ?? 0);
  const shownRating = hoverRating ?? currentRating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const starIndex = i + 1;
          const fillPercentage = Math.min(
            1,
            Math.max(0, shownRating - i)
          );
          const isFull = fillPercentage >= 1;
          const isPartial = fillPercentage > 0 && fillPercentage < 1;

          return (
            <motion.button
              key={i}
              type="button"
              disabled={!interactive}
              className={cn(
                "relative cursor-default outline-none",
                interactive && "cursor-pointer"
              )}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              onClick={() => {
                if (interactive && onChange) {
                  onChange(starIndex);
                }
              }}
              whileTap={interactive ? { scale: 1.3 } : undefined}
              animate={
                interactive && value === starIndex
                  ? { scale: [1, 1.25, 1] }
                  : {}
              }
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {/* Empty star (background) */}
              <Star
                className={cn(sizeMap[size], "text-muted-foreground/30")}
                fill="currentColor"
                strokeWidth={0}
              />

              {/* Filled star (overlay) */}
              {(isFull || isPartial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star
                    className={cn(sizeMap[size], "text-amber-400")}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {showValue && (
        <AnimatePresence mode="wait">
          <motion.span
            key={shownRating.toFixed(1)}
            className="ml-1.5 text-sm font-medium text-muted-foreground"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {shownRating.toFixed(1)}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}
