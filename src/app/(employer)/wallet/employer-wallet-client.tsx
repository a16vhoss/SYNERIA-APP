"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  Send,
  FileSignature,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { DepositModal } from "@/components/employer/deposit-modal";
import {
  PaymentModal,
  type ActiveContract,
} from "@/components/employer/payment-modal";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const sparklineData = [
  { v: 8000 },
  { v: 7200 },
  { v: 9500 },
  { v: 8800 },
  { v: 10200 },
  { v: 9600 },
  { v: 11000 },
  { v: 10500 },
  { v: 12200 },
  { v: 11800 },
  { v: 12850 },
];

type TxType = "payment_sent" | "deposit" | "fee";
type TxStatus = "completed" | "pending";

interface EmployerTransaction {
  id: string;
  type: TxType;
  description: string;
  date: string;
  amount: number;
  status: TxStatus;
}

const mockTransactions: EmployerTransaction[] = [
  {
    id: "et1",
    type: "payment_sent",
    description: "Pago a Carlos Mendez - Albañil",
    date: "28 Mar 2026",
    amount: -2200,
    status: "completed",
  },
  {
    id: "et2",
    type: "deposit",
    description: "Deposito - Transferencia bancaria",
    date: "25 Mar 2026",
    amount: 5000,
    status: "completed",
  },
  {
    id: "et3",
    type: "payment_sent",
    description: "Pago a Maria Lopez - Electricista",
    date: "20 Mar 2026",
    amount: -1800,
    status: "completed",
  },
  {
    id: "et4",
    type: "fee",
    description: "Comision plataforma",
    date: "20 Mar 2026",
    amount: -27,
    status: "completed",
  },
  {
    id: "et5",
    type: "payment_sent",
    description: "Pago a Juan Perez - Plomero",
    date: "15 Mar 2026",
    amount: -1500,
    status: "pending",
  },
  {
    id: "et6",
    type: "deposit",
    description: "Deposito - Tarjeta de credito",
    date: "10 Mar 2026",
    amount: 8000,
    status: "completed",
  },
];

const mockContracts: ActiveContract[] = [
  {
    id: "c1",
    workerName: "Carlos Mendez",
    position: "Albañil Senior",
    salary: 2200,
  },
  {
    id: "c2",
    workerName: "Maria Lopez",
    position: "Electricista",
    salary: 1800,
  },
  {
    id: "c3",
    workerName: "Juan Perez",
    position: "Plomero",
    salary: 1500,
  },
];

const txTypeConfig: Record<
  TxType,
  { icon: typeof ArrowUpRight; color: string; bg: string }
> = {
  payment_sent: {
    icon: ArrowUpRight,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  deposit: {
    icon: ArrowDownLeft,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  fee: {
    icon: DollarSign,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
};

const statusCfg: Record<
  TxStatus,
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmployerWalletClient() {
  const [balance, setBalance] = useState(12850);
  const [depositOpen, setDepositOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleDeposit = useCallback((amount: number) => {
    setBalance((prev) => prev + amount);
  }, []);

  const handlePayment = useCallback(
    (contractId: string, amount: number) => {
      const fee = amount * 0.015;
      setBalance((prev) => prev - amount - fee);
    },
    []
  );

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Wallet Empresarial"
        subtitle="Gestiona fondos y realiza pagos a tu equipo de trabajo"
      />

      {/* Balance Card */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] ring-1 ring-foreground/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-brand-100">
                <TrendingUp className="size-4 text-brand-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Balance Empresarial
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <AnimatedCounter
                target={balance}
                prefix="$"
                format="currency"
                className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl"
              />
              <span className="text-lg font-medium text-muted-foreground">
                USD
              </span>
            </div>

            <motion.div
              className="flex gap-3 pt-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                className="gap-2 bg-brand-600 px-5 py-2 text-white hover:bg-brand-700"
                size="lg"
                onClick={() => setDepositOpen(true)}
              >
                <Landmark className="size-4" />
                Depositar Fondos
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-5 py-2"
                onClick={() => setPaymentOpen(true)}
              >
                <Send className="size-4" />
                Enviar Pago
              </Button>
            </motion.div>
          </div>

          {/* Sparkline */}
          <motion.div
            className="h-24 w-full max-w-xs lg:h-28 lg:w-64"
            initial={{ opacity: 0, scaleX: 0.3 }}
            animate={chartReady ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            style={{ originX: 0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient
                    id="empBalanceGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  fill="url(#empBalanceGrad)"
                  dot={false}
                  isAnimationActive={chartReady}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-foreground/5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-100">
            <FileSignature className="size-5 text-brand-600" />
          </div>
          <AnimatedCounter
            target={mockContracts.length}
            className="font-heading text-2xl font-bold text-foreground"
          />
          <span className="text-xs text-muted-foreground">
            Contratos Activos
          </span>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-foreground/5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
            <Clock className="size-5 text-amber-600" />
          </div>
          <AnimatedCounter
            target={5500}
            prefix="$"
            format="currency"
            className="font-heading text-2xl font-bold text-foreground"
          />
          <span className="text-xs text-muted-foreground">
            Pagos este mes
          </span>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-foreground/5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <AnimatedCounter
            target={13000}
            prefix="$"
            format="currency"
            className="font-heading text-2xl font-bold text-foreground"
          />
          <span className="text-xs text-muted-foreground">
            Total depositado
          </span>
        </motion.div>
      </div>

      {/* Active Contracts */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="font-heading text-lg font-bold text-foreground">
          Contratos Activos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockContracts.map((contract, i) => (
            <motion.div
              key={contract.id}
              className="rounded-xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-foreground/5"
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.4 + i * 0.06 },
              }}
              whileHover={{
                y: -2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                  {contract.workerName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {contract.workerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contract.position}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Salario mensual
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ${contract.salary.toLocaleString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-1 text-xs"
                onClick={() => {
                  setPaymentOpen(true);
                }}
              >
                <Send className="size-3" />
                Enviar Pago
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-heading text-lg font-bold text-foreground">
          Historial de Transacciones
        </h2>

        <div className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)] ring-1 ring-foreground/5">
          {mockTransactions.map((tx, i) => {
            const cfg = txTypeConfig[tx.type];
            const sCfg = statusCfg[tx.status];
            const Icon = cfg.icon;
            const isPositive = tx.amount > 0;

            return (
              <motion.div
                key={tx.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-4",
                  i < mockTransactions.length - 1 &&
                    "border-b border-foreground/5"
                )}
                initial={{ opacity: 0, x: -12 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.55 + i * 0.05 },
                }}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    cfg.bg
                  )}
                >
                  <Icon className={cn("size-5", cfg.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
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
                <span
                  className={cn(
                    "hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:inline-flex",
                    sCfg.bg,
                    sCfg.text
                  )}
                >
                  <span
                    className={cn("size-1.5 rounded-full", sCfg.dot)}
                  />
                  {sCfg.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modals */}
      <DepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onDeposit={handleDeposit}
      />
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        contracts={mockContracts}
        balance={balance}
        onPayment={handlePayment}
      />
    </motion.div>
  );
}
