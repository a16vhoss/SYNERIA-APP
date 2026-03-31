"use client";

import { Briefcase, Users, CalendarCheck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
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
  const stats = [
    {
      icon: Briefcase,
      label: "Vacantes Activas",
      value: activeVacancies,
      variant: "default" as const,
    },
    {
      icon: Users,
      label: "Candidatos Recibidos",
      value: totalCandidates,
      variant: "blue" as const,
    },
    {
      icon: CalendarCheck,
      label: "En Entrevista",
      value: inInterview,
      variant: "purple" as const,
    },
    {
      icon: UserCheck,
      label: "Aceptados",
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
