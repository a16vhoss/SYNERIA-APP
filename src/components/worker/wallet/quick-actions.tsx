"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeftRight,
  Shield,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Action definitions                                                 */
/* ------------------------------------------------------------------ */

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

/* Action definitions are now resolved inside the component via useTranslations */

/* ------------------------------------------------------------------ */
/*  Container variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface QuickActionsProps {
  onAction?: (id: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const t = useTranslations("worker");

  const actions: QuickAction[] = [
    {
      id: "remesas",
      label: t("wallet.remittance.title"),
      icon: Send,
      color: "text-brand-600",
      bgColor: "bg-brand-100",
    },
    {
      id: "cambio",
      label: t("wallet.swap.title"),
      icon: ArrowLeftRight,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
    },
    {
      id: "microseguros",
      label: "Microseguros",
      icon: Shield,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
    },
    {
      id: "recargas",
      label: "Recargas",
      icon: Smartphone,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  return (
    <motion.div
      className="flex items-start justify-between gap-4 sm:justify-start sm:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            type="button"
            variants={itemVariants}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 outline-none"
            onClick={() => onAction?.(action.id)}
          >
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-full transition-shadow",
                action.bgColor,
                "hover:shadow-md"
              )}
            >
              <Icon className={cn("size-6", action.color)} />
            </div>
            <span className="max-w-[80px] text-center text-xs font-medium text-muted-foreground">
              {action.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
