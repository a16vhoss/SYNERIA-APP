"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENT_OPTIONS = [
  { key: "green", from: "from-brand-500", to: "to-brand-700", label: "Verde" },
  { key: "orange", from: "from-amber-400", to: "to-orange-600", label: "Naranja" },
  { key: "purple", from: "from-violet-400", to: "to-purple-700", label: "Purpura" },
  { key: "blue", from: "from-sky-400", to: "to-blue-600", label: "Azul" },
  { key: "red", from: "from-rose-400", to: "to-red-600", label: "Rojo" },
  { key: "teal", from: "from-teal-400", to: "to-emerald-600", label: "Teal" },
] as const;

interface GradientPickerProps {
  value: string;
  onChange: (gradient: string) => void;
}

export function GradientPicker({ value, onChange }: GradientPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {GRADIENT_OPTIONS.map((gradient, index) => {
        const isSelected = value === gradient.key;
        return (
          <motion.button
            key={gradient.key}
            type="button"
            onClick={() => onChange(gradient.key)}
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full bg-gradient-to-br transition-all",
              gradient.from,
              gradient.to,
              isSelected
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "ring-1 ring-foreground/10"
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: index * 0.05,
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Gradiente ${gradient.label}`}
          >
            {isSelected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Check className="size-4 text-white drop-shadow-md" />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
