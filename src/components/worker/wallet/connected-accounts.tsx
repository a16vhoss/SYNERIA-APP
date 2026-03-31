"use client";

import { motion } from "framer-motion";
import { Building2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface ConnectedAccount {
  id: string;
  bankName: string;
  lastFour: string;
  type: string;
}

const mockAccounts: ConnectedAccount[] = [
  {
    id: "a1",
    bankName: "Banco Santander",
    lastFour: "7832",
    type: "Cuenta Corriente",
  },
  {
    id: "a2",
    bankName: "UBS Switzerland",
    lastFour: "4501",
    type: "Cuenta Ahorro",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConnectedAccounts() {
  return (
    <motion.div
      className="space-y-4"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      <h3 className="font-heading text-base font-bold text-foreground">
        Cuentas Conectadas
      </h3>

      <div className="space-y-3">
        {mockAccounts.map((account) => (
          <motion.div
            key={account.id}
            variants={itemVariants}
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-card)] ring-1 ring-foreground/5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
              <Building2 className="size-5 text-brand-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {account.bankName}
              </p>
              <p className="text-xs text-muted-foreground">
                ****{account.lastFour} &middot; {account.type}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <CheckCircle2 className="size-3" />
              Conectada
            </span>
          </motion.div>
        ))}

        <motion.div variants={itemVariants}>
          <Button
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={() =>
              toast.info("Conexion bancaria disponible proximamente")
            }
          >
            <Plus className="size-4" />
            Agregar cuenta bancaria
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
