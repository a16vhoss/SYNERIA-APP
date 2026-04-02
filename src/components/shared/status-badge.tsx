"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const statusConfig = {
  active: { bg: "bg-status-active-bg", text: "text-status-active", dot: "bg-status-active" },
  pending: { bg: "bg-status-pending-bg", text: "text-status-pending", dot: "bg-status-pending" },
  reviewing: { bg: "bg-sky-100", text: "text-sky-600", dot: "bg-sky-500" },
  interview: { bg: "bg-violet-100", text: "text-violet-600", dot: "bg-violet-500" },
  accepted: { bg: "bg-status-active-bg", text: "text-status-active", dot: "bg-status-active" },
  rejected: { bg: "bg-status-closed-bg", text: "text-status-closed", dot: "bg-status-closed" },
  paused: { bg: "bg-status-paused-bg", text: "text-status-paused", dot: "bg-status-paused" },
  closed: { bg: "bg-status-closed-bg", text: "text-status-closed", dot: "bg-status-closed" },
  completed: { bg: "bg-status-completed-bg", text: "text-status-completed", dot: "bg-status-completed" },
  draft: { bg: "bg-status-paused-bg", text: "text-status-paused", dot: "bg-status-paused" },
  cancelacion_solicitada: { bg: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-500" },
  en_disputa: { bg: "bg-status-closed-bg", text: "text-status-closed", dot: "bg-status-closed" },
} as const;

const statusToKey: Record<string, string> = {
  active: "active",
  pending: "pending",
  reviewing: "reviewing",
  interview: "interview",
  accepted: "accepted",
  rejected: "rejected",
  paused: "paused",
  closed: "closed",
  completed: "completed",
  draft: "draft",
  cancelacion_solicitada: "cancellationRequested",
  en_disputa: "inDispute",
};

type StatusType = keyof typeof statusConfig;

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
} as const;

interface StatusBadgeProps {
  status: StatusType;
  size?: keyof typeof sizeStyles;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  dot = true,
  className,
}: StatusBadgeProps) {
  const t = useTranslations("common");
  const config = statusConfig[status];
  const translationKey = statusToKey[status] ?? status;

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.bg,
        config.text,
        sizeStyles[size],
        className
      )}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {dot && (
        <motion.span
          className={cn("size-1.5 rounded-full", config.dot)}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
      {t(`status.${translationKey}`)}
    </motion.span>
  );
}
