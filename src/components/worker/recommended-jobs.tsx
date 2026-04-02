"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { JobCard, EmptyState } from "@/components/shared";
import type { JobData } from "@/components/shared";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

interface RecommendedJobsProps {
  jobs: JobData[];
}

export function RecommendedJobs({ jobs }: RecommendedJobsProps) {
  const t = useTranslations("worker");

  return (
    <section className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <motion.h2
          className="font-heading text-lg font-semibold text-foreground"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {t("dashboard.recommendedJobs")}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/jobs"
            className="group flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            {t("dashboard.viewAll")}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      {/* Job cards grid or empty state */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("dashboard.noRecommendations")}
          description={t("dashboard.noRecommendationsDesc")}
          action={{
            label: t("dashboard.completeProfile"),
            onClick: () => {
              window.location.href = "/profile";
            },
          }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {jobs.map((job, index) => (
            <motion.div key={job.id} variants={item}>
              <JobCard job={job} index={index} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
