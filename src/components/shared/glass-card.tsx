"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-white/20 bg-white/60 p-5 backdrop-blur-md",
        "shadow-[var(--shadow-card)]",
        "dark:border-white/10 dark:bg-white/5",
        className
      )}
      whileHover={
        hover
          ? {
              scale: 1.01,
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.08), 0 0 1px rgba(255,255,255,0.3) inset",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
