"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";
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

// Payment method labels are set dynamically inside the component using translations

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
  const t = useTranslations("employer");
  const tc = useTranslations("common");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const paymentMethods = [
    { value: "bank_transfer", label: t("wallet.deposit.bankTransfer") },
    { value: "credit_card", label: t("wallet.deposit.creditCard") },
    { value: "debit_card", label: t("wallet.deposit.debitCard") },
    { value: "crypto", label: t("wallet.deposit.crypto") },
  ];

  const parsedAmount = parseFloat(amount) || 0;

  const handleDeposit = () => {
    if (parsedAmount <= 0 || !method) {
      toast.error(tc("fillAllFields"));
      return;
    }
    onDeposit?.(parsedAmount);
    toast.success(t("wallet.deposit.success"));
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
            {t("wallet.deposit.title")}
          </DialogTitle>
          <DialogDescription>
            {t("wallet.deposit.subtitle")}
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
            <Label htmlFor="dep-amount">{t("wallet.deposit.amount")}</Label>
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
            <Label>{t("wallet.deposit.method")}</Label>
            <Select
              value={method}
              onValueChange={(v) => v && setMethod(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("wallet.deposit.method")} />
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
            {t("wallet.deposit.title")} ${parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
