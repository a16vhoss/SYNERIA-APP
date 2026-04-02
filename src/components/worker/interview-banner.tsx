"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface InterviewBannerProps {
  companyName: string;
  jobTitle: string;
  date: string;
  time: string;
  interviewId: string;
}

export function InterviewBanner({
  companyName,
  jobTitle,
  date,
  time,
  interviewId,
}: InterviewBannerProps) {
  const t = useTranslations("worker");
  const [dismissed, setDismissed] = useState(false);

  // Check sessionStorage on mount to persist dismissal within session
  const storageKey = `interview-banner-dismissed-${interviewId}`;
  const wasDismissed =
    typeof window !== "undefined" &&
    sessionStorage.getItem(storageKey) === "true";

  if (wasDismissed || dismissed) return null;

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "true");
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-teal-50 px-5 py-4 ring-1 ring-teal-200/60"
          initial={{ opacity: 0, y: -16, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -16, height: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {/* Icon */}
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            <Calendar className="size-5" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-sm font-semibold text-teal-800">
              {t("interviews.scheduled")}
            </p>
            <span className="text-sm text-teal-600">
              {date} {t("interviews.atTime")} {time} &mdash; {companyName}
            </span>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/applications?interview=${interviewId}`}
              className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700"
            >
              {t("jobs.detail.aboutJob")}
            </Link>
            <button
              onClick={handleDismiss}
              className="rounded-full p-1 text-teal-400 transition-colors hover:bg-teal-100 hover:text-teal-600"
              aria-label="Cerrar banner"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
