"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  DollarSign,
  Send,
  Percent,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/shared/animated-counter";

/* ------------------------------------------------------------------ */
/*  Mini bar chart data                                                */
/* ------------------------------------------------------------------ */

const miniBarData = [
  { v: 3 },
  { v: 5 },
  { v: 4 },
  { v: 7 },
  { v: 6 },
  { v: 8 },
];

/* ------------------------------------------------------------------ */
/*  Stats definitions                                                  */
/* ------------------------------------------------------------------ */

interface FinancialStat {
  id: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  icon: typeof DollarSign;
  color: string;
  bgColor: string;
  detail: string;
  showChart?: boolean;
}

function getStats(t: ReturnType<typeof useTranslations>): FinancialStat[] {
  return [
    {
      id: "earned",
      label: t("wallet.stats.earnedThisMonth"),
      value: 3200,
      prefix: "$",
      suffix: "",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      detail: t("wallet.stats.vsLastMonth"),
    },
    {
      id: "remittances",
      label: t("wallet.stats.remittancesSent"),
      value: 800,
      prefix: "$",
      suffix: "",
      icon: Send,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
      detail: t("wallet.stats.transfers", { count: 2 }),
    },
    {
      id: "fees",
      label: t("wallet.stats.feesSaved"),
      value: 120,
      prefix: "$",
      suffix: "",
      icon: Percent,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
      detail: t("wallet.stats.vsTraditional"),
    },
    {
      id: "payments",
      label: t("wallet.stats.paymentsReceived"),
      value: 6,
      prefix: "",
      suffix: "",
      icon: BarChart3,
      color: "text-brand-600",
      bgColor: "bg-brand-100",
      detail: "",
      showChart: true,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 22 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FinancialStats() {
  const t = useTranslations("worker");
  const stats = getStats(t);

  return (
    <motion.div className="space-y-4" initial="hidden" animate="show">
      <h2 className="font-heading text-lg font-bold text-foreground">
        {t("wallet.stats.title")}
      </h2>

      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={containerVariants}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              variants={cardVariants}
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-foreground/5"
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  stat.bgColor
                )}
              >
                <Icon className={cn("size-5", stat.color)} />
              </div>

              <div className="flex items-end gap-1">
                <AnimatedCounter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="font-heading text-2xl font-bold tracking-tight text-foreground"
                />
              </div>

              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>

              {stat.detail && (
                <span className="text-[10px] text-muted-foreground/70">
                  {stat.detail}
                </span>
              )}

              {stat.showChart && (
                <div className="h-10 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={miniBarData}>
                      <Bar
                        dataKey="v"
                        fill="#2D6A4F"
                        radius={[2, 2, 0, 0]}
                        isAnimationActive
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
