"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Star,
  ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type TransactionType =
  | "income"
  | "remittance"
  | "swap"
  | "bonus"
  | "withdrawal";
type TransactionStatus = "completed" | "pending";
type FilterTab = "todas" | "ingresos" | "enviadas";

interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  date: string;
  amount: number;
  status: TransactionStatus;
}

const typeConfig: Record<
  TransactionType,
  { icon: LucideIcon; color: string; bg: string }
> = {
  income: {
    icon: ArrowDownLeft,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  remittance: {
    icon: ArrowUpRight,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  swap: {
    icon: ArrowLeftRight,
    color: "text-sky-600",
    bg: "bg-sky-100",
  },
  bonus: {
    icon: Star,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  withdrawal: {
    icon: ArrowDown,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
};

const statusConfig: Record<
  TransactionStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  completed: {
    label: "Completado",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pendiente",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
};

/* ------------------------------------------------------------------ */
/*  Mock transactions                                                  */
/* ------------------------------------------------------------------ */

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    type: "income",
    description: "Pago - Constructora Alpine S.A.",
    date: "15 Mar 2026",
    amount: 2200.0,
    status: "completed",
  },
  {
    id: "t2",
    type: "remittance",
    description: "Remesa a Maria Ramirez (Mexico)",
    date: "12 Mar 2026",
    amount: -600.0,
    status: "completed",
  },
  {
    id: "t3",
    type: "remittance",
    description: "Remesa a familia (Colombia)",
    date: "10 Mar 2026",
    amount: -400.0,
    status: "completed",
  },
  {
    id: "t4",
    type: "income",
    description: "Pago - Constructora Alpine S.A.",
    date: "1 Mar 2026",
    amount: 2200.0,
    status: "completed",
  },
  {
    id: "t5",
    type: "swap",
    description: "Cambio USD → EUR",
    date: "28 Feb 2026",
    amount: -500.0,
    status: "completed",
  },
  {
    id: "t6",
    type: "bonus",
    description: "Bono de bienvenida",
    date: "25 Feb 2026",
    amount: 50.0,
    status: "completed",
  },
];

/* ------------------------------------------------------------------ */
/*  Filter tabs                                                        */
/* ------------------------------------------------------------------ */

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "ingresos", label: "Ingresos" },
  { key: "enviadas", label: "Enviadas" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TransactionList() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("todas");

  const filtered = mockTransactions.filter((tx) => {
    if (activeFilter === "todas") return true;
    if (activeFilter === "ingresos") return tx.amount > 0;
    return tx.amount < 0;
  });

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Transacciones Recientes
        </h2>

        <div className="flex items-center gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-card)] ring-1 ring-foreground/5">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-brand-600"
                    layoutId="txFilter"
                    style={{ zIndex: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction rows */}
      <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)] ring-1 ring-foreground/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No hay transacciones en esta categoria.
              </div>
            ) : (
              filtered.map((tx, i) => {
                const cfg = typeConfig[tx.type];
                const statusCfg = statusConfig[tx.status];
                const Icon = cfg.icon;
                const isPositive = tx.amount > 0;

                return (
                  <motion.div
                    key={tx.id}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4",
                      i < filtered.length - 1 && "border-b border-foreground/5"
                    )}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: i * 0.05 },
                    }}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        cfg.bg
                      )}
                    >
                      <Icon className={cn("size-5", cfg.color)} />
                    </div>

                    {/* Description + date */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isPositive ? "text-emerald-600" : "text-foreground"
                        )}
                      >
                        {isPositive ? "+" : ""}$
                        {Math.abs(tx.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={cn(
                        "hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:inline-flex",
                        statusCfg.bg,
                        statusCfg.text
                      )}
                    >
                      <span
                        className={cn("size-1.5 rounded-full", statusCfg.dot)}
                      />
                      {statusCfg.label}
                    </span>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
