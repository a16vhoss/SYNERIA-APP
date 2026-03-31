"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ContractStatus } from "@/lib/actions/contracts";

const statusConfig: Record<
  ContractStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pendiente: {
    label: "PENDIENTE",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  activo: {
    label: "ACTIVO",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  completado: {
    label: "COMPLETADO",
    bg: "bg-sky-100",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  expirado: {
    label: "EXPIRADO",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  cancelado: {
    label: "CANCELADO",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  cancelacion_solicitada: {
    label: "CANCELACION SOLICITADA",
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  en_disputa: {
    label: "EN DISPUTA",
    bg: "bg-rose-100",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
} as const;

interface ContractStatusBadgeProps {
  status: ContractStatus;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export function ContractStatusBadge({
  status,
  size = "md",
  className,
}: ContractStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide",
        config.bg,
        config.text,
        sizeStyles[size],
        className
      )}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <motion.span
        className={cn("size-1.5 rounded-full", config.dot)}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      />
      {config.label}
    </motion.span>
  );
}
