"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SkillEndorsement } from "@/lib/constants/mock-data";

interface EndorsementSectionProps {
  endorsements: SkillEndorsement[];
  isConnected?: boolean;
  onEndorse?: (skillName: string) => void;
  className?: string;
}

export function EndorsementSection({
  endorsements,
  isConnected = false,
  onEndorse,
  className,
}: EndorsementSectionProps) {
  const t = useTranslations("worker");

  return (
    <motion.div
      className={cn("flex flex-col gap-4", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="flex items-center gap-2">
        <Award className="size-5 text-brand-600" />
        <h3 className="font-heading text-base font-semibold text-foreground">
          {t("network.skillEndorsements")}
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {endorsements.map((endorsement, i) => (
          <EndorsementItem
            key={endorsement.skillName}
            endorsement={endorsement}
            index={i}
            isConnected={isConnected}
            onEndorse={onEndorse}
            endorseLabel={t("network.endorse")}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single endorsement row                                             */
/* ------------------------------------------------------------------ */

function EndorsementItem({
  endorsement,
  index,
  isConnected,
  onEndorse,
  endorseLabel,
}: {
  endorsement: SkillEndorsement;
  index: number;
  isConnected: boolean;
  onEndorse?: (skillName: string) => void;
  endorseLabel: string;
}) {
  const [localCount, setLocalCount] = useState(endorsement.count);
  const [endorsed, setEndorsed] = useState(false);

  function handleEndorse() {
    if (endorsed) return;
    setEndorsed(true);
    setLocalCount((prev) => prev + 1);
    onEndorse?.(endorsement.skillName);
  }

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/15 bg-white/40 px-4 py-3",
        "dark:border-white/8 dark:bg-white/5"
      )}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.06,
      }}
    >
      {/* Skill name */}
      <span className="flex-1 text-sm font-medium text-foreground">
        {endorsement.skillName}
      </span>

      {/* Endorser avatars (stacked) */}
      <div className="flex -space-x-2">
        {endorsement.endorsers.slice(0, 3).map((endorser, i) => (
          <div
            key={endorser.name}
            className={cn(
              "flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white",
              "bg-gradient-to-br",
              endorser.avatarGradient === "green" && "from-brand-500 to-brand-700",
              endorser.avatarGradient === "orange" && "from-amber-400 to-orange-600",
              endorser.avatarGradient === "purple" && "from-violet-400 to-purple-700",
              endorser.avatarGradient === "blue" && "from-sky-400 to-blue-600",
              endorser.avatarGradient === "red" && "from-rose-400 to-red-600",
              endorser.avatarGradient === "teal" && "from-teal-400 to-emerald-600"
            )}
            style={{ zIndex: 3 - i }}
            title={endorser.name}
          >
            {endorser.avatarLetter}
          </div>
        ))}
        {endorsement.endorsers.length > 3 && (
          <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-muted text-[9px] font-medium text-muted-foreground">
            +{endorsement.endorsers.length - 3}
          </div>
        )}
      </div>

      {/* Count badge */}
      <AnimatePresence mode="wait">
        <motion.span
          key={localCount}
          className="min-w-[2rem] rounded-full bg-brand-100 px-2 py-0.5 text-center text-xs font-semibold text-brand-700"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {localCount}
        </motion.span>
      </AnimatePresence>

      {/* Endorse button */}
      {isConnected && (
        <Button
          variant={endorsed ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={handleEndorse}
          disabled={endorsed}
          title={endorseLabel}
        >
          <Plus className="size-3.5" />
        </Button>
      )}
    </motion.div>
  );
}
