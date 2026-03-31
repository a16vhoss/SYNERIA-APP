"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Activa", bg: "bg-status-active-bg", text: "text-status-active", dot: "bg-status-active" },
  pending: { label: "Pendiente", bg: "bg-status-pending-bg", text: "text-status-pending", dot: "bg-status-pending" },
  reviewing: { label: "En Revisión", bg: "bg-sky-100", text: "text-sky-600", dot: "bg-sky-500" },
  interview: { label: "Entrevista", bg: "bg-violet-100", text: "text-violet-600", dot: "bg-violet-500" },
  accepted: { label: "Aceptada", bg: "bg-status-active-bg", text: "text-status-active", dot: "bg-status-active" },
  rejected: { label: "Rechazada", bg: "bg-status-closed-bg", text: "text-status-closed", dot: "bg-status-closed" },
  paused: { label: "Pausada", bg: "bg-status-paused-bg", text: "text-status-paused", dot: "bg-status-paused" },
  closed: { label: "Cerrada", bg: "bg-status-closed-bg", text: "text-status-closed", dot: "bg-status-closed" },
  completed: { label: "Completada", bg: "bg-status-completed-bg", text: "text-status-completed", dot: "bg-status-completed" },
  draft: { label: "Borrador", bg: "bg-status-paused-bg", text: "text-status-paused", dot: "bg-status-paused" },
  cancelacion_solicitada: { label: "Cancelación", bg: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-500" },
  en_disputa: { label: "En Disputa", bg: "bg-status-closed-bg", text: "text-status-closed", dot: "bg-status-closed" },
} as const;

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
  const config = statusConfig[status];

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
      {config.label}
    </motion.span>
  );
}
