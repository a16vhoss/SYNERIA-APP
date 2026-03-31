"use client";

import { Briefcase, Users, CalendarCheck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/shared/stat-card";

interface DashboardStatsProps {
  activeVacancies: number;
  totalCandidates: number;
  inInterview: number;
  accepted: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardStats({
  activeVacancies,
  totalCandidates,
  inInterview,
  accepted,
}: DashboardStatsProps) {
  const t = useTranslations("employer");
  const stats = [
    {
      icon: Briefcase,
      label: t("dashboard.stats.activeVacancies"),
      value: activeVacancies,
      variant: "default" as const,
    },
    {
      icon: Users,
      label: t("dashboard.stats.totalCandidates"),
      value: totalCandidates,
      variant: "blue" as const,
    },
    {
      icon: CalendarCheck,
      label: t("candidates.pipeline.interview"),
      value: inInterview,
      variant: "purple" as const,
    },
    {
      icon: UserCheck,
      label: t("candidates.pipeline.hired"),
      value: accepted,
      variant: "teal" as const,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={item}>
          <StatCard
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            variant={stat.variant}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
