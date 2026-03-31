"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
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
/*  Payment methods                                                    */
/* ------------------------------------------------------------------ */

const paymentMethods = [
  { value: "bank_transfer", label: "Transferencia Bancaria" },
  { value: "credit_card", label: "Tarjeta de Credito" },
  { value: "debit_card", label: "Tarjeta de Debito" },
  { value: "crypto", label: "Criptomoneda (USDC)" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeposit?: (amount: number) => void;
}

export function DepositModal({
  open,
  onOpenChange,
  onDeposit,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const parsedAmount = parseFloat(amount) || 0;

  const handleDeposit = () => {
    if (parsedAmount <= 0 || !method) {
      toast.error("Completa todos los campos");
      return;
    }
    onDeposit?.(parsedAmount);
    toast.success(`Deposito de $${parsedAmount.toFixed(2)} procesado`);
    setAmount("");
    setMethod("");
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setAmount("");
      setMethod("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="size-5 text-brand-600" />
            Depositar Fondos
          </DialogTitle>
          <DialogDescription>
            Agrega fondos a tu wallet para realizar pagos a trabajadores.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="dep-amount">Monto (USD)</Label>
            <Input
              id="dep-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Payment method */}
          <div className="space-y-1.5">
            <Label>Metodo de pago</Label>
            <Select
              value={method}
              onValueChange={(v) => v && setMethod(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar metodo" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[500, 1000, 2500, 5000].map((amt) => (
              <Button
                key={amt}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setAmount(String(amt))}
              >
                ${amt.toLocaleString()}
              </Button>
            ))}
          </div>
        </motion.div>

        <DialogFooter>
          <Button
            className="w-full gap-2 bg-brand-600 text-white hover:bg-brand-700"
            onClick={handleDeposit}
            disabled={parsedAmount <= 0 || !method}
          >
            <Landmark className="size-4" />
            Depositar ${parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
