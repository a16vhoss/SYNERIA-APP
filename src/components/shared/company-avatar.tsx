"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

const gradientPresets: Record<string, string> = {
  green: "from-brand-500 to-brand-700",
  orange: "from-amber-400 to-orange-600",
  purple: "from-violet-400 to-purple-700",
  blue: "from-sky-400 to-blue-600",
  red: "from-rose-400 to-red-600",
  teal: "from-teal-400 to-emerald-600",
};

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-xl",
  xl: "size-20 text-3xl",
} as const;

interface CompanyAvatarProps {
  letter: string;
  gradient?: keyof typeof gradientPresets;
  size?: keyof typeof sizeMap;
  imageUrl?: string;
  className?: string;
}

export function CompanyAvatar({
  letter,
  gradient = "green",
  size = "md",
  imageUrl,
  className,
}: CompanyAvatarProps) {
  return (
    <motion.div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-heading font-bold text-white select-none",
        !imageUrl && `bg-gradient-to-br ${gradientPresets[gradient]}`,
        sizeMap[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={letter}
          fill
          className="rounded-full object-cover"
        />
      ) : (
        <span className="leading-none">{letter.charAt(0).toUpperCase()}</span>
      )}
    </motion.div>
  );
}
