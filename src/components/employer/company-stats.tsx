"use client";

import { motion } from "framer-motion";
import { Users, Briefcase, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/shared/stat-card";

interface CompanyStatsProps {
  employeesCount: number;
  activeJobs: number;
  avgRating: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CompanyStats({
  employeesCount,
  activeJobs,
  avgRating,
}: CompanyStatsProps) {
  const t = useTranslations("employer");
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <StatCard
          icon={Users}
          label={t("companyProfile.size")}
          value={employeesCount}
          variant="default"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          icon={Briefcase}
          label={t("dashboard.stats.activeVacancies")}
          value={activeJobs}
          variant="blue"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          icon={Star}
          label={t("companyProfile.avgRating")}
          value={avgRating}
          suffix="/5"
          variant="orange"
        />
      </motion.div>
    </motion.div>
  );
}
