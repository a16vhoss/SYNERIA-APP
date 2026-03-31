"use client";

import { Briefcase, FileText, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/shared";

/* ------------------------------------------------------------------ */
/*  Progress Ring – mini circular progress for "Perfil completado"     */
/* ------------------------------------------------------------------ */

function ProgressRing({
  percentage,
  size = 48,
  strokeWidth = 4,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-brand-100"
        />
        {/* Filled arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-brand-600"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-brand-700">
        {percentage}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile Stat Card (uses progress ring instead of number)           */
/* ------------------------------------------------------------------ */

function ProfileStatCard({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "group flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow",
        "shadow-[var(--shadow-card)]",
        className
      )}
      whileHover={{
        y: -2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Icon */}
      <div className="flex size-11 items-center justify-center rounded-full bg-violet-100 text-violet-600">
        <User className="size-5" />
      </div>

      {/* Progress Ring */}
      <ProgressRing percentage={percentage} />

      {/* Label */}
      <span className="text-sm text-muted-foreground">Perfil completado</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Container – Staggered grid of 4 cards                              */
/* ------------------------------------------------------------------ */

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

interface DashboardStatsProps {
  availableJobs: number;
  myApplications: number;
  notifications: number;
  profileCompletion: number;
}

export function DashboardStats({
  availableJobs,
  myApplications,
  notifications,
  profileCompletion,
}: DashboardStatsProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <StatCard
          icon={Briefcase}
          label="Empleos disponibles"
          value={availableJobs}
          variant="default"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          icon={FileText}
          label="Mis aplicaciones"
          value={myApplications}
          variant="blue"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          icon={Bell}
          label="Notificaciones"
          value={notifications}
          variant="orange"
        />
      </motion.div>
      <motion.div variants={item}>
        <ProfileStatCard percentage={profileCompletion} />
      </motion.div>
    </motion.div>
  );
}
