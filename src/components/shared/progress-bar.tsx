"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const colorVariants = {
  primary: "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
} as const;

const trackColors = {
  primary: "bg-brand-100",
  success: "bg-emerald-100",
  warning: "bg-amber-100",
} as const;

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: keyof typeof colorVariants;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  color = "primary",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm text-muted-foreground">{label}</span>
          )}
          {showPercentage && (
            <motion.span
              className="text-sm font-medium text-foreground"
              key={clamped}
              initial={{ opacity: 0.5, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(clamped)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          "relative h-2 overflow-hidden rounded-full",
          trackColors[color]
        )}
      >
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", colorVariants[color])}
          initial={{ width: "0%" }}
          animate={{ width: `${clamped}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 0.8,
          }}
        />
      </div>
    </div>
  );
}
