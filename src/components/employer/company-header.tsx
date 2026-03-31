"use client";

import { motion } from "framer-motion";
import { MapPin, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { StarRating } from "@/components/shared/star-rating";

interface CompanyHeaderProps {
  name: string;
  letter: string;
  gradient?: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  sector?: string;
  location?: string;
  verified?: boolean;
  rating?: number;
  imageUrl?: string;
}

export function CompanyHeader({
  name,
  letter,
  gradient = "green",
  sector,
  location,
  verified = false,
  rating = 0,
  imageUrl,
}: CompanyHeaderProps) {
  const t = useTranslations("employer");
  return (
    <motion.div
      className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {/* Large avatar */}
      <CompanyAvatar
        letter={letter}
        gradient={gradient}
        size="xl"
        imageUrl={imageUrl}
      />

      {/* Info */}
      <div className="flex flex-col gap-2">
        {/* Name + verified */}
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <motion.h1
            className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 22 }}
          >
            {name}
          </motion.h1>
          {verified && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
              title={t("companyProfile.verified")}
            >
              <BadgeCheck className="size-6 text-brand-600" />
            </motion.span>
          )}
        </div>

        {/* Sector badge */}
        {sector && (
          <motion.span
            className="inline-flex w-fit self-center rounded-full bg-brand-100 px-3 py-0.5 text-xs font-medium text-brand-700 sm:self-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {sector}
          </motion.span>
        )}

        {/* Location */}
        {location && (
          <motion.div
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="size-3.5" />
            <span>{location}</span>
          </motion.div>
        )}

        {/* Star rating */}
        {rating > 0 && (
          <motion.div
            className="flex justify-center sm:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <StarRating rating={rating} showValue size="md" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
