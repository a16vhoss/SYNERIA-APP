"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ collapsed = false, className, size = "md" }: LogoProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-center gap-0.5", className)}
    >
      {collapsed ? (
        <motion.span
          className={cn(
            "font-heading font-bold tracking-tight text-brand-700",
            textSizes[size]
          )}
          whileHover={{ scale: 1.05 }}
        >
          S
          <motion.span
            className={cn(
              "ml-0.5 inline-block rounded-full bg-brand-600",
              dotSizes[size]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
          />
        </motion.span>
      ) : (
        <>
          <motion.span
            className={cn(
              "font-heading font-bold tracking-tight text-brand-700",
              textSizes[size]
            )}
          >
            Syneria
          </motion.span>
          <motion.span
            className={cn(
              "inline-block rounded-full bg-brand-600",
              dotSizes[size]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
