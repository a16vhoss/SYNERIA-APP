"use client";

import { motion } from "framer-motion";
import { Briefcase, PauseCircle, Users } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import type { MockVacancy } from "@/lib/constants/mock-data";

interface VacancyStatsProps {
  vacancies: MockVacancy[];
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function VacancyStats({ vacancies }: VacancyStatsProps) {
  const active = vacancies.filter((v) => v.status === "active").length;
  const paused = vacancies.filter((v) => v.status === "paused").length;
  const totalApplications = vacancies.reduce(
    (sum, v) => sum + v.applications_count,
    0
  );

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={item}>
        <StatCard
          icon={Briefcase}
          label="Vacantes Activas"
          value={active}
          variant="default"
          trend={
            active > 0
              ? { direction: "up", percentage: 12 }
              : undefined
          }
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          icon={PauseCircle}
          label="Vacantes Pausadas"
          value={paused}
          variant="orange"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          icon={Users}
          label="Total Aplicaciones"
          value={totalApplications}
          variant="blue"
          trend={
            totalApplications > 0
              ? { direction: "up", percentage: 8 }
              : undefined
          }
        />
      </motion.div>
    </motion.div>
  );
}
