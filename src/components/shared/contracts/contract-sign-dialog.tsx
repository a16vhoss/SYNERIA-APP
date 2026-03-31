"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileSignature, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContractSignatureCanvas } from "./contract-signature-canvas";
import type { ContractData } from "@/lib/actions/contracts";

interface ContractSignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractData | null;
  onSign: (contractId: string, signatureData: string) => Promise<{ hash: string; signedAt: string }>;
}

type Step = "terms" | "accept" | "signature" | "success";

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export function ContractSignDialog({
  open,
  onOpenChange,
  contract,
  onSign,
}: ContractSignDialogProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");

  const [step, setStep] = useState<Step>("terms");
  const [accepted, setAccepted] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [result, setResult] = useState<{ hash: string; signedAt: string } | null>(null);

  function resetState() {
    setStep("terms");
    setAccepted(false);
    setSignatureData(null);
    setSigning(false);
    setResult(null);
  }

  function handleClose(v: boolean) {
    if (!v) resetState();
    onOpenChange(v);
  }

  async function handleSign() {
    if (!contract || !signatureData) return;
    setSigning(true);
    try {
      const res = await onSign(contract.id, signatureData);
      setResult(res);
      setStep("success");
    } catch {
      // handle error silently
    } finally {
      setSigning(false);
    }
  }

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
            <FileSignature className="size-5 text-brand-600" />
            {t("contracts.sign.title")}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Terms */}
          {step === "terms" && (
            <motion.div
              key="terms"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("contracts.sign.review")}
                </p>
                <p className="font-semibold text-foreground">
                  {contract.position}
                </p>
                <p className="text-sm text-muted-foreground">
                  {contract.company_name} - {contract.city}, {contract.country}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">
                  {t("contracts.detail.scope")}
                </p>
                <ScrollArea className="h-48 rounded-lg border border-foreground/10 bg-white p-3">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>{contract.terms}</p>
                    <div>
                      <p className="font-medium text-foreground">{t("jobs.detail.type")}:</p>
                      <p>{contract.work_schedule}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("jobs.detail.salary")}:</p>
                      <p>
                        {contract.currency} ${contract.salary.toLocaleString()}
                        /mes
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("contracts.detail.startDate")} - {t("contracts.detail.endDate")}:</p>
                      <p>
                        {contract.start_date} {tc("misc.to")} {contract.end_date}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("jobs.detail.benefits")}:</p>
                      <ul className="ml-4 list-disc">
                        {contract.benefits.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    {contract.visa_sponsorship && (
                      <div>
                        <p className="font-medium text-foreground">
                          {t("contracts.detail.deliverables")}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  {tc("actions.cancel")}
                </Button>
                <Button
                  onClick={() => setStep("accept")}
                  className="bg-brand-600 text-white hover:bg-brand-700"
                >
                  {tc("actions.continue")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 2: Accept terms */}
          {step === "accept" && (
            <motion.div
              key="accept"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-5 text-amber-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-800">
                      {tc("actions.confirm")}
                    </p>
                    <p className="text-sm text-amber-700">
                      {t("contracts.sign.agree")}
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-foreground/10 p-3 transition-colors hover:bg-muted/50">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  {t("contracts.sign.agree")}
                </span>
              </label>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("terms")}>
                  {tc("actions.back")}
                </Button>
                <Button
                  onClick={() => setStep("signature")}
                  disabled={!accepted}
                  className="bg-brand-600 text-white hover:bg-brand-700"
                >
                  {tc("actions.continue")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 3: Signature canvas */}
          {step === "signature" && (
            <motion.div
              key="signature"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                {t("contracts.sign.review")}
              </p>

              <ContractSignatureCanvas
                onSignatureChange={setSignatureData}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("accept")}>
                  {tc("actions.back")}
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={!signatureData || signing}
                  className="bg-brand-600 text-white hover:bg-brand-700"
                >
                  <FileSignature
                    className="size-4"
                    data-icon="inline-start"
                  />
                  {signing ? t("contracts.sign.signing") : t("contracts.sign.sign")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === "success" && result && (
            <motion.div
              key="success"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 15,
                  delay: 0.1,
                }}
                className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100"
              >
                <CheckCircle2 className="size-8 text-emerald-600" />
              </motion.div>

              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {t("contracts.sign.signed")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tc("misc.savedSuccessfully")}
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-left">
                <p className="text-xs font-medium text-muted-foreground">
                  {tc("misc.info")}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-foreground">
                  {result.hash}
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => handleClose(false)}
                  className="w-full bg-brand-600 text-white hover:bg-brand-700"
                >
                  {tc("actions.close")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
