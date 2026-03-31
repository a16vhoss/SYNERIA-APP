"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

const variantStyles = {
  default: "bg-brand-100 text-brand-600",
  orange: "bg-amber-100 text-amber-600",
  blue: "bg-sky-100 text-sky-600",
  purple: "bg-violet-100 text-violet-600",
  red: "bg-rose-100 text-rose-600",
  teal: "bg-teal-100 text-teal-600",
} as const;

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  variant?: keyof typeof variantStyles;
  prefix?: string;
  suffix?: string;
  format?: "number" | "currency" | "compact";
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  variant = "default",
  prefix,
  suffix,
  format = "number",
  className,
}: StatCardProps) {
  return (
    <motion.div
      className={cn(
        "group flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow",
        "shadow-[var(--shadow-card)]",
        className
      )}
      whileHover={{
        y: -2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          variantStyles[variant]
        )}
      >
        <Icon className="size-5" />
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <AnimatedCounter
          target={value}
          prefix={prefix}
          suffix={suffix}
          format={format}
          className="font-heading text-3xl font-bold tracking-tight text-foreground"
        />
        {trend && (
          <motion.span
            className={cn(
              "mb-1 flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-emerald-600" : "text-rose-500"
            )}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {trend.percentage}%
          </motion.span>
        )}
      </div>

      {/* Label */}
      <span className="text-sm text-muted-foreground">{label}</span>
    </motion.div>
  );
}
