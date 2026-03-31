"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Ban } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ContractData } from "@/lib/actions/contracts";

interface ContractCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractData | null;
  mode: "request" | "respond";
  onRequestCancel: (contractId: string, reason: string) => Promise<void>;
  onRespondCancel: (contractId: string, accept: boolean) => Promise<void>;
}

type RequestStep = "reason" | "confirm";

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export function ContractCancelDialog({
  open,
  onOpenChange,
  contract,
  mode,
  onRequestCancel,
  onRespondCancel,
}: ContractCancelDialogProps) {
  const [reason, setReason] = useState("");
  const [requestStep, setRequestStep] = useState<RequestStep>("reason");
  const [loading, setLoading] = useState(false);

  function resetState() {
    setReason("");
    setRequestStep("reason");
    setLoading(false);
  }

  function handleClose(v: boolean) {
    if (!v) resetState();
    onOpenChange(v);
  }

  async function handleRequestSubmit() {
    if (!contract) return;
    setLoading(true);
    try {
      await onRequestCancel(contract.id, reason);
      handleClose(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(accept: boolean) {
    if (!contract) return;
    setLoading(true);
    try {
      await onRespondCancel(contract.id, accept);
      handleClose(false);
    } finally {
      setLoading(false);
    }
  }

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
            <Ban className="size-5 text-red-600" />
            {mode === "request"
              ? "Solicitar Cancelacion"
              : "Responder a Solicitud de Cancelacion"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {mode === "request" && requestStep === "reason" && (
            <motion.div
              key="reason"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium text-foreground">
                  {contract.position}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contract.company_name}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">
                  Motivo de cancelacion
                </Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Explica el motivo por el cual deseas cancelar este contrato..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Volver
                </Button>
                <Button
                  onClick={() => setRequestStep("confirm")}
                  disabled={reason.trim().length < 10}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Continuar
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {mode === "request" && requestStep === "confirm" && (
            <motion.div
              key="confirm"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 text-red-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-800">
                      Confirmar Solicitud
                    </p>
                    <p className="text-sm text-red-700">
                      Esta accion enviara una solicitud de cancelacion a la
                      otra parte. El contrato no se cancelara hasta que ambas
                      partes esten de acuerdo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Tu motivo:
                </p>
                <p className="mt-1 text-sm text-foreground">{reason}</p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRequestStep("reason")}
                >
                  Atras
                </Button>
                <Button
                  onClick={handleRequestSubmit}
                  disabled={loading}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {loading ? "Enviando..." : "Confirmar Cancelacion"}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {mode === "respond" && (
            <motion.div
              key="respond"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium text-foreground">
                  {contract.position}
                </p>
                <p className="text-xs text-muted-foreground">
                  Solicitado por:{" "}
                  {contract.cancellation_requested_by === "worker"
                    ? contract.worker_name
                    : contract.company_name}
                </p>
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-xs font-medium text-orange-800">
                  Motivo de cancelacion:
                </p>
                <p className="mt-1 text-sm text-orange-700">
                  {contract.cancellation_reason || "Sin motivo especificado"}
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => handleRespond(false)}
                  disabled={loading}
                  className="bg-orange-600 text-white hover:bg-orange-700"
                >
                  Disputar
                </Button>
                <Button
                  onClick={() => handleRespond(true)}
                  disabled={loading}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Aceptar Cancelacion
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
