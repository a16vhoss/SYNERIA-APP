"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ActiveContract {
  id: string;
  workerName: string;
  position: string;
  salary: number;
}

const FEE_RATE = 0.015; // 1.5%

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contracts: ActiveContract[];
  balance: number;
  onPayment?: (contractId: string, amount: number) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  contracts,
  balance,
  onPayment,
}: PaymentModalProps) {
  const [selectedContractId, setSelectedContractId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const selectedContract = contracts.find(
    (c) => c.id === selectedContractId
  );

  // Auto-fill amount and description when contract changes
  useEffect(() => {
    if (selectedContract) {
      setAmount(String(selectedContract.salary));
      const month = new Date().toLocaleDateString("es-ES", { month: "long" });
      setDescription(`Pago mensual ${month}`);
    }
  }, [selectedContract]);

  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * FEE_RATE;
  const totalDeducted = parsedAmount + fee;
  const balanceAfter = balance - totalDeducted;
  const insufficient = totalDeducted > balance;

  const handleSend = () => {
    if (!selectedContractId || parsedAmount <= 0) {
      toast.error("Completa todos los campos");
      return;
    }
    if (insufficient) {
      toast.error("Saldo insuficiente");
      return;
    }
    onPayment?.(selectedContractId, parsedAmount);
    toast.success(
      `Pago de $${parsedAmount.toFixed(2)} enviado a ${selectedContract?.workerName}`
    );
    setSelectedContractId("");
    setAmount("");
    setDescription("");
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedContractId("");
      setAmount("");
      setDescription("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-brand-600" />
            Enviar Pago
          </DialogTitle>
          <DialogDescription>
            Envia un pago a un trabajador de tu equipo.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Contract select */}
          <div className="space-y-1.5">
            <Label>Contrato</Label>
            <Select
              value={selectedContractId}
              onValueChange={(v) => v && setSelectedContractId(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar contrato" />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.workerName} - {c.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Monto (USD)</Label>
            <Input
              id="pay-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-desc">Descripcion</Label>
            <Input
              id="pay-desc"
              placeholder="Pago mensual marzo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Summary */}
          {parsedAmount > 0 && (
            <motion.div
              className="space-y-2 rounded-xl bg-muted/50 p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto del pago</span>
                <span className="font-medium">${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Comision plataforma (1.5%)
                </span>
                <span className="font-medium">${fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-foreground/10 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Total a deducir
                  </span>
                  <span className="font-bold">${totalDeducted.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Balance despues del pago
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      balanceAfter < 0 ? "text-rose-600" : "text-foreground"
                    )}
                  >
                    ${balanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>
              {insufficient && (
                <p className="text-xs font-medium text-rose-600">
                  Saldo insuficiente. Deposita fondos antes de enviar.
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        <DialogFooter>
          <Button
            className="w-full gap-2 bg-brand-600 text-white hover:bg-brand-700"
            onClick={handleSend}
            disabled={
              insufficient || parsedAmount <= 0 || !selectedContractId
            }
          >
            <Send className="size-4" />
            Enviar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
