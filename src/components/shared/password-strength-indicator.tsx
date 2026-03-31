"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

type Strength = 0 | 1 | 2 | 3;

function calculateStrength(password: string): Strength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return 1;
  if (score <= 3) return 2;
  return 3;
}

const strengthConfig: Record<
  Strength,
  { label: string; color: string; segments: number }
> = {
  0: { label: "", color: "bg-muted", segments: 0 },
  1: { label: "Débil", color: "bg-rose-500", segments: 1 },
  2: { label: "Media", color: "bg-amber-500", segments: 2 },
  3: { label: "Fuerte", color: "bg-emerald-500", segments: 3 },
};

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const config = strengthConfig[strength];

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* 3-segment bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                segment <= config.segments ? config.color : "bg-muted"
              )}
              initial={{ width: "0%" }}
              animate={{
                width: segment <= config.segments ? "100%" : "0%",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: segment * 0.08,
              }}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      {password.length > 0 && (
        <motion.p
          className={cn(
            "text-xs font-medium",
            strength === 1 && "text-rose-500",
            strength === 2 && "text-amber-500",
            strength === 3 && "text-emerald-500"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {config.label}
        </motion.p>
      )}
    </div>
  );
}
