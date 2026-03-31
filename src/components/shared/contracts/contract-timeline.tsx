"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ContractStatusBadge } from "./contract-status-badge";
import type { ContractData } from "@/lib/actions/contracts";

interface ContractTimelineProps {
  contracts: ContractData[];
  currentId?: string;
  className?: string;
}

const nodeVariants = {
  hidden: { opacity: 0, y: -16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
};

export function ContractTimeline({
  contracts,
  currentId,
  className,
}: ContractTimelineProps) {
  if (contracts.length === 0) return null;

  return (
    <div className={cn("relative space-y-0", className)}>
      {contracts.map((contract, i) => {
        const isCurrent = contract.id === currentId;
        const isLast = i === contracts.length - 1;

        return (
          <motion.div
            key={contract.id}
            custom={i}
            variants={nodeVariants}
            initial="hidden"
            animate="visible"
            className="relative flex gap-4"
          >
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "size-3 rounded-full ring-2 ring-white",
                  isCurrent ? "bg-brand-600" : "bg-muted-foreground/30"
                )}
              />
              {!isLast && (
                <div className="w-px flex-1 bg-foreground/10" />
              )}
            </div>

            {/* Node content */}
            <div
              className={cn(
                "mb-4 flex-1 rounded-lg border p-3",
                isCurrent
                  ? "border-brand-200 bg-brand-50/50"
                  : "border-foreground/5 bg-card"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {contract.start_date} - {contract.end_date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contract.currency} ${contract.salary.toLocaleString()}/mes
                  </p>
                </div>
                <ContractStatusBadge status={contract.status} size="sm" />
              </div>
              {isCurrent && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                  Contrato actual
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
