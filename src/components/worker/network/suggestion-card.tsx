"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { X, MapPin, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NetworkSuggestion } from "@/lib/constants/mock-data";

/* Reason labels are resolved inside the component via useTranslations */

const reasonColors: Record<NetworkSuggestion["reason"], string> = {
  same_company: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  same_country: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  same_sector: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  mutual_connections: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

interface SuggestionCardProps {
  suggestion: NetworkSuggestion;
  index?: number;
  onConnect?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function SuggestionCard({
  suggestion,
  index = 0,
  onConnect,
  onDismiss,
}: SuggestionCardProps) {
  const t = useTranslations("worker");

  const reasonLabelMap: Record<NetworkSuggestion["reason"], string> = {
    same_company: t("network.sameCompany"),
    same_country: t("network.sameCountry"),
    same_sector: t("network.sameSector"),
    mutual_connections: t("network.mutualConnections"),
  };

  const reasonText =
    suggestion.reason === "mutual_connections"
      ? `${suggestion.mutualConnections} ${reasonLabelMap[suggestion.reason]}`
      : suggestion.reason === "same_company" && suggestion.reasonDetail
        ? suggestion.reasonDetail
        : reasonLabelMap[suggestion.reason];

  return (
    <motion.div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-white/20 bg-white/60 p-5 backdrop-blur-md",
        "shadow-[var(--shadow-card)]",
        "dark:border-white/10 dark:bg-white/5"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.06,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow:
          "0 8px 30px rgba(0,0,0,0.08), 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDismiss?.(suggestion.id)}
      >
        <X className="size-3.5" />
      </Button>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <CompanyAvatar
          letter={suggestion.avatarLetter}
          gradient={suggestion.avatarGradient}
          size="lg"
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-sm font-semibold text-foreground leading-tight">
            {suggestion.name}
          </h3>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {suggestion.city}, {suggestion.country}
          </span>
        </div>
      </div>

      {/* Skills */}
      {suggestion.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestion.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[10px]">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Reason badge */}
      <div
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
          reasonColors[suggestion.reason]
        )}
      >
        {reasonText}
      </div>

      {/* Connect button */}
      <Button
        size="sm"
        className="mt-auto w-full"
        onClick={() => onConnect?.(suggestion.id)}
      >
        <UserPlus className="mr-1.5 size-3.5" />
        {t("network.connect")}
      </Button>
    </motion.div>
  );
}
