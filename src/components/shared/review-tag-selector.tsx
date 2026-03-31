"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ALL_REVIEW_TAGS, type ReviewTag } from "@/lib/constants/mock-data";

interface ReviewTagSelectorProps {
  selected: ReviewTag[];
  onChange: (tags: ReviewTag[]) => void;
  maxSelectable?: number;
  className?: string;
}

export function ReviewTagSelector({
  selected,
  onChange,
  maxSelectable = 5,
  className,
}: ReviewTagSelectorProps) {
  function toggle(tag: ReviewTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < maxSelectable) {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {ALL_REVIEW_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        const isDisabled = !isSelected && selected.length >= maxSelectable;

        return (
          <motion.button
            key={tag}
            type="button"
            disabled={isDisabled}
            onClick={() => toggle(tag)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isSelected
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              isDisabled && "cursor-not-allowed opacity-40"
            )}
            whileTap={!isDisabled ? { scale: 0.93 } : undefined}
            animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {tag}
          </motion.button>
        );
      })}
      <p className="w-full text-[11px] text-muted-foreground">
        {selected.length}/{maxSelectable} seleccionados
      </p>
    </div>
  );
}
