"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { RefreshCw, DollarSign, Calendar, FileText } from "lucide-react";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { renewContract } from "@/lib/actions/contracts";
import type { ContractData } from "@/lib/actions/contracts";

/* ------------------------------------------------------------------ */
/*  Schema factory                                                     */
/* ------------------------------------------------------------------ */

function createRenewSchema(t: (key: string) => string) {
  return z.object({
    salary: z.string().min(1, t("contracts.create.errors.enterSalary")),
    currency: z.string().min(1, t("contracts.create.errors.selectCurrency")),
    start_date: z.string().min(1, t("contracts.create.errors.enterStartDate")),
    end_date: z.string().min(1, t("contracts.create.errors.enterEndDate")),
    terms: z.string().min(10, t("contracts.create.errors.minChars10")),
  });
}

type RenewFormData = z.infer<ReturnType<typeof createRenewSchema>>;

/* ------------------------------------------------------------------ */
/*  Benefits keys                                                      */
/* ------------------------------------------------------------------ */

const BENEFIT_KEYS = [
  "housing",
  "healthInsurance",
  "transport",
  "meals",
  "training",
  "tools",
  "laptop",
  "extraVacation",
] as const;

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 + i * 0.04,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface RenewContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentContract: ContractData | null;
  onRenewed: (contract: ContractData) => void;
}

export function RenewContractForm({
  open,
  onOpenChange,
  parentContract,
  onRenewed,
}: RenewContractFormProps) {
  const t = useTranslations("employer");
  const tc = useTranslations("common");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  const renewSchema = createRenewSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RenewFormData>({
    resolver: zodResolver(renewSchema) as any,
  });

  // Pre-fill form when parentContract changes
  useEffect(() => {
    if (parentContract) {
      reset({
        salary: String(parentContract.salary),
        currency: parentContract.currency,
        start_date: parentContract.end_date,
        end_date: "",
        terms: parentContract.terms,
      });
      setSelectedBenefits(parentContract.benefits);
    }
  }, [parentContract, reset]);

  function toggleBenefit(benefitKey: string) {
    setSelectedBenefits((prev) =>
      prev.includes(benefitKey)
        ? prev.filter((b) => b !== benefitKey)
        : [...prev, benefitKey]
    );
  }

  async function onFormSubmit(data: RenewFormData) {
    if (!parentContract) return;

    const result = await renewContract(parentContract.id, {
      salary: Number(data.salary),
      currency: data.currency,
      start_date: data.start_date,
      end_date: data.end_date,
      terms: data.terms,
      benefits: selectedBenefits,
    });

    onRenewed(result);
    reset();
    setSelectedBenefits([]);
  }

  function handleClose(v: boolean) {
    if (!v) {
      reset();
      setSelectedBenefits([]);
    }
    onOpenChange(v);
  }

  if (!parentContract) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
            <RefreshCw className="size-5 text-brand-600" />
            {t("contracts.manage.renew")}
          </DialogTitle>
        </DialogHeader>

        {/* Parent contract info */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("contracts.manage.originalContract")}
          </p>
          <p className="font-semibold text-foreground">
            {parentContract.worker_name} - {parentContract.position}
          </p>
          <p className="text-xs text-muted-foreground">
            {parentContract.start_date} a {parentContract.end_date}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="space-y-5"
        >
          {/* Salary */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              custom={0}
              variants={fieldVariants}
              className="flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              <DollarSign className="size-4" />
              {t("vacancies.create.salary")}
            </motion.p>

            <motion.div
              custom={1}
              variants={fieldVariants}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <Label htmlFor="salary">{t("contracts.create.salary")}</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="salary"
                    type="number"
                    placeholder="3000"
                    {...register("salary")}
                    className="pl-8"
                  />
                </div>
                {errors.salary && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.salary.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="currency">{t("contracts.create.currency")}</Label>
                <select
                  id="currency"
                  {...register("currency")}
                  className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="CHF">CHF</option>
                  <option value="GBP">GBP</option>
                  <option value="NOK">NOK</option>
                  <option value="SEK">SEK</option>
                  <option value="CLP">CLP</option>
                  <option value="COP">COP</option>
                </select>
              </div>
            </motion.div>
          </motion.div>

          {/* Dates */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              custom={2}
              variants={fieldVariants}
              className="flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              <Calendar className="size-4" />
              {t("contracts.create.dates")}
            </motion.p>

            <motion.div
              custom={3}
              variants={fieldVariants}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <Label htmlFor="start_date">{t("contracts.create.startDate")}</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  className="mt-1"
                />
                {errors.start_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="end_date">{t("contracts.create.endDate")}</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className="mt-1"
                />
                {errors.end_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Terms + Benefits */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              custom={4}
              variants={fieldVariants}
              className="flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              <FileText className="size-4" />
              {t("contracts.create.termsAndBenefits")}
            </motion.p>

            <motion.div custom={5} variants={fieldVariants}>
              <Label htmlFor="terms">{t("contracts.create.terms")}</Label>
              <Textarea
                id="terms"
                placeholder={t("contracts.renew.termsPlaceholder")}
                {...register("terms")}
                className="mt-1 min-h-24"
              />
              {errors.terms && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.terms.message}
                </p>
              )}
            </motion.div>

            <motion.div custom={6} variants={fieldVariants}>
              <Label className="mb-2 block">{t("vacancies.create.benefits")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {BENEFIT_KEYS.map((benefitKey) => (
                  <label
                    key={benefitKey}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-foreground/5 p-2 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedBenefits.includes(benefitKey)}
                      onCheckedChange={() => toggleBenefit(benefitKey)}
                    />
                    <span className="text-sm">{t(`contracts.create.benefits.${benefitKey}`)}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 text-white hover:bg-brand-700"
            >
              <RefreshCw className="size-4" data-icon="inline-start" />
              {isSubmitting ? t("contracts.create.sending") : t("contracts.manage.sendRenewal")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
