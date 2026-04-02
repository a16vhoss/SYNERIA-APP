"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ReviewBannerProps {
  counterpartyName: string;
  onReview: () => void;
  className?: string;
}

export function ReviewBanner({
  counterpartyName,
  onReview,
  className,
}: ReviewBannerProps) {
  const t = useTranslations("worker");
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className={cn(
            "relative flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3",
            "dark:border-amber-800 dark:bg-amber-900/20",
            className
          )}
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Star className="size-4 text-amber-600" />
          </div>

          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {t("reviews.rateExperience")} {counterpartyName}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("reviews.rateExperienceDesc")}
            </span>
          </div>

          <Button size="sm" onClick={onReview}>
            {t("reviews.leaveReview")}
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-1.5 right-1.5"
            onClick={() => setDismissed(true)}
          >
            <X className="size-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
