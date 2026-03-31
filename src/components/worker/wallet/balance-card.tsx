"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Mock sparkline data                                                */
/* ------------------------------------------------------------------ */

const sparklineData = [
  { v: 3200 },
  { v: 3400 },
  { v: 3100 },
  { v: 3600 },
  { v: 3900 },
  { v: 4100 },
  { v: 3800 },
  { v: 4200 },
  { v: 4500 },
  { v: 4300 },
  { v: 4600 },
  { v: 4850 },
];

/* ------------------------------------------------------------------ */
/*  Animated Dollar Counter                                            */
/* ------------------------------------------------------------------ */

function AnimatedBalance({
  target,
  className,
}: {
  target: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 80,
    duration: 2000,
  });

  const displayed = useTransform(springValue, (latest) =>
    latest.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsub = displayed.on("change", (v) => {
      if (ref.current) ref.current.textContent = `$${v}`;
    });
    return unsub;
  }, [displayed]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      $0.00
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Balance Card                                                       */
/* ------------------------------------------------------------------ */

interface BalanceCardProps {
  balance?: number;
  eurBalance?: number;
  onSendMoney?: () => void;
  onReceive?: () => void;
}

export function BalanceCard({
  balance = 4850.0,
  eurBalance = 4465.0,
  onSendMoney,
  onReceive,
}: BalanceCardProps) {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] ring-1 ring-foreground/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Green gradient accent top-left */}
      <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Balance info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-100">
              <TrendingUp className="size-4 text-brand-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Balance Total
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <AnimatedBalance
              target={balance}
              className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl"
            />
            <span className="text-lg font-medium text-muted-foreground">
              USD
            </span>
          </div>

          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            ~&euro;{eurBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex gap-3 pt-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              className="gap-2 bg-brand-600 px-5 py-2 text-white hover:bg-brand-700"
              size="lg"
              onClick={onSendMoney}
            >
              <ArrowUpRight className="size-4" />
              Enviar Dinero
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-5 py-2"
              onClick={onReceive}
            >
              <ArrowDownLeft className="size-4" />
              Recibir
            </Button>
          </motion.div>
        </div>

        {/* Right: Mini sparkline */}
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
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#2D6A4F"
                strokeWidth={2}
                fill="url(#balanceGrad)"
                dot={false}
                isAnimationActive={chartReady}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
