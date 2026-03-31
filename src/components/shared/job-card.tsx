"use client";

import { MapPin, Bookmark, BookmarkCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "./company-avatar";

interface JobTag {
  label: string;
  variant?: "visa" | "housing" | "urgent" | "default";
}

export interface JobData {
  id: string;
  companyName: string;
  companyLetter: string;
  companyGradient?: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  companyLogoUrl?: string;
  title: string;
  location: string;
  salary: string;
  tags?: JobTag[];
}

interface JobCardProps {
  job: JobData;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
  index?: number;
  className?: string;
}

const tagColors: Record<string, string> = {
  visa: "bg-sky-100 text-sky-700",
  housing: "bg-violet-100 text-violet-700",
  urgent: "bg-rose-100 text-rose-700",
  default: "bg-muted text-muted-foreground",
};

export function JobCard({
  job,
  onApply,
  onSave,
  isSaved = false,
  index = 0,
  className,
}: JobCardProps) {
  return (
    <motion.div
      className={cn(
        "group flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10",
        "shadow-[var(--shadow-card)] transition-shadow",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.015,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header: avatar + company */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CompanyAvatar
            letter={job.companyLetter}
            gradient={job.companyGradient}
            size="md"
            imageUrl={job.companyLogoUrl}
          />
          <span className="text-sm text-muted-foreground">
            {job.companyName}
          </span>
        </div>
        <motion.button
          onClick={() => onSave?.(job.id)}
          className="text-muted-foreground transition-colors hover:text-brand-600"
          whileTap={{ scale: 0.85 }}
          aria-label={isSaved ? "Quitar de guardados" : "Guardar empleo"}
        >
          {isSaved ? (
            <BookmarkCheck className="size-5 text-brand-600" />
          ) : (
            <Bookmark className="size-5" />
          )}
        </motion.button>
      </div>

      {/* Title */}
      <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
        {job.title}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-3.5" />
        <span>{job.location}</span>
      </div>

      {/* Salary */}
      <span className="text-sm font-semibold text-emerald-600">
        {job.salary}
      </span>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                tagColors[tag.variant ?? "default"]
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 pt-2">
        <Button
          className="flex-1"
          onClick={() => onApply?.(job.id)}
        >
          Aplicar
        </Button>
      </div>
    </motion.div>
  );
}
