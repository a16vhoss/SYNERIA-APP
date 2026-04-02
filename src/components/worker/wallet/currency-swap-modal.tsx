"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
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
/*  Currency data                                                      */
/* ------------------------------------------------------------------ */

const CURRENCY_KEYS = ["usd", "eur", "gbp", "chf", "mxn"] as const;
const CURRENCY_VALUES = ["USD", "EUR", "GBP", "CHF", "MXN"] as const;

const exchangeRates: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, CHF: 0.88, MXN: 17.15 },
  EUR: { USD: 1.087, GBP: 0.86, CHF: 0.96, MXN: 18.65 },
  GBP: { USD: 1.266, EUR: 1.163, CHF: 1.11, MXN: 21.7 },
  CHF: { USD: 1.136, EUR: 1.04, GBP: 0.9, MXN: 19.5 },
  MXN: { USD: 0.058, EUR: 0.054, GBP: 0.046, CHF: 0.051 },
};

const SWAP_FEE = 0.01; // 1%

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CurrencySwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurrencySwapModal({
  open,
  onOpenChange,
}: CurrencySwapModalProps) {
  const t = useTranslations("worker");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");

  const parsedAmount = parseFloat(amount) || 0;
  const rate =
    fromCurrency !== toCurrency
      ? exchangeRates[fromCurrency]?.[toCurrency] ?? 0
      : 1;
  const fee = parsedAmount * SWAP_FEE;
  const resultAmount = (parsedAmount - fee) * rate;

  const canSwap =
    parsedAmount > 0 && fromCurrency !== toCurrency && rate > 0;

  const handleSwap = () => {
    if (!canSwap) return;
    toast.success(t("wallet.swap.success"));
    setAmount("");
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) setAmount("");
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="size-5 text-sky-600" />
            {t("wallet.swap.title")}
          </DialogTitle>
          <DialogDescription>
            {t("wallet.swap.description")}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* From */}
          <div className="space-y-1.5">
            <Label>{t("wallet.swap.from")}</Label>
            <Select
              value={fromCurrency}
              onValueChange={(v) => v && setFromCurrency(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_VALUES.map((val, i) => (
                  <SelectItem key={val} value={val}>
                    {t(`wallet.currencies.${CURRENCY_KEYS[i]}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To */}
          <div className="space-y-1.5">
            <Label>{t("wallet.swap.to")}</Label>
            <Select
              value={toCurrency}
              onValueChange={(v) => v && setToCurrency(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_VALUES.map((val, i) => (
                  <SelectItem key={val} value={val}>
                    {t(`wallet.currencies.${CURRENCY_KEYS[i]}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="swap-amount">{t("wallet.swap.amount")} ({fromCurrency})</Label>
            <Input
              id="swap-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Summary */}
          {parsedAmount > 0 && rate > 0 && fromCurrency !== toCurrency && (
            <motion.div
              className="space-y-2 rounded-xl bg-muted/50 p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("wallet.swap.exchangeRate")}</span>
                <span className="font-medium">
                  1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("wallet.swap.fee")}
                </span>
                <span className="font-medium">
                  {fee.toFixed(2)} {fromCurrency}
                </span>
              </div>
              <div className="border-t border-foreground/10 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {t("wallet.swap.youWillReceive")}
                  </span>
                  <span className="font-bold text-brand-600">
                    {resultAmount.toFixed(2)} {toCurrency}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <DialogFooter>
          <Button
            className="w-full gap-2 bg-sky-600 text-white hover:bg-sky-700"
            onClick={handleSwap}
            disabled={!canSwap}
          >
            <ArrowLeftRight className="size-4" />
            {t("wallet.swap.swapButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
