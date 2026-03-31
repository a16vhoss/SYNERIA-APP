"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
/*  Country data with exchange rates                                   */
/* ------------------------------------------------------------------ */

const countries = [
  { value: "MX", label: "Mexico (MXN)", rate: 17.15 },
  { value: "CO", label: "Colombia (COP)", rate: 3920 },
  { value: "GT", label: "Guatemala (GTQ)", rate: 7.83 },
  { value: "HN", label: "Honduras (HNL)", rate: 24.7 },
  { value: "SV", label: "El Salvador (USD)", rate: 1.0 },
  { value: "PE", label: "Peru (PEN)", rate: 3.72 },
];

const FEE_RATE = 0.025; // 2.5%

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface RemittanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance?: number;
}

export function RemittanceModal({
  open,
  onOpenChange,
  balance = 4850,
}: RemittanceModalProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [country, setCountry] = useState("");

  const parsedAmount = parseFloat(amount) || 0;
  const selectedCountry = countries.find((c) => c.value === country);
  const fee = parsedAmount * FEE_RATE;
  const totalDeducted = parsedAmount + fee;
  const localAmount = selectedCountry
    ? parsedAmount * selectedCountry.rate
    : 0;
  const insufficient = totalDeducted > balance;

  const handleSend = () => {
    if (!recipient || !country || parsedAmount <= 0) {
      toast.error("Completa todos los campos");
      return;
    }
    if (insufficient) {
      toast.error("Saldo insuficiente");
      return;
    }
    toast.success(
      `Remesa de $${parsedAmount.toFixed(2)} enviada a ${recipient}`
    );
    setAmount("");
    setRecipient("");
    setCountry("");
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setAmount("");
      setRecipient("");
      setCountry("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-brand-600" />
            Enviar Remesa
          </DialogTitle>
          <DialogDescription>
            Envia dinero a tus familiares de forma rapida y segura.
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
            <Label htmlFor="rem-amount">Monto (USD)</Label>
            <Input
              id="rem-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Recipient */}
          <div className="space-y-1.5">
            <Label htmlFor="rem-recipient">Nombre del destinatario</Label>
            <Input
              id="rem-recipient"
              placeholder="Maria Ramirez"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label>Pais del destinatario</Label>
            <Select
              value={country}
              onValueChange={(v) => v && setCountry(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar pais" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {parsedAmount > 0 && selectedCountry && (
            <motion.div
              className="space-y-2 rounded-xl bg-muted/50 p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tasa de cambio
                </span>
                <span className="font-medium">
                  1 USD = {selectedCountry.rate.toLocaleString()}{" "}
                  {selectedCountry.label.match(/\(([^)]+)\)/)?.[1]}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Comision (2.5%)
                </span>
                <span className="font-medium">${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Monto en moneda local
                </span>
                <span className="font-semibold text-brand-600">
                  {localAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t border-foreground/10 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Total a deducir
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      insufficient ? "text-rose-600" : "text-foreground"
                    )}
                  >
                    ${totalDeducted.toFixed(2)}
                  </span>
                </div>
              </div>
              {insufficient && (
                <p className="text-xs font-medium text-rose-600">
                  Saldo insuficiente. Balance actual: ${balance.toFixed(2)}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        <DialogFooter>
          <Button
            className="w-full gap-2 bg-brand-600 text-white hover:bg-brand-700"
            onClick={handleSend}
            disabled={insufficient || parsedAmount <= 0 || !recipient || !country}
          >
            <Send className="size-4" />
            Enviar Remesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
