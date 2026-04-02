"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  ChevronDown,
  FileSignature,
  Ban,
  Star,
  Download,
  RefreshCw,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { ProgressBar } from "@/components/shared/progress-bar";
import { ContractStatusBadge } from "./contract-status-badge";
import { useTranslations } from "next-intl";
import type { ContractData } from "@/lib/actions/contracts";

interface ContractCardProps {
  contract: ContractData;
  role: "worker" | "employer";
  onSign?: (contract: ContractData) => void;
  onCancel?: (contract: ContractData) => void;
  onReview?: (contract: ContractData) => void;
  onRenew?: (contract: ContractData) => void;
  onRespondCancel?: (contract: ContractData) => void;
}

function getTimeProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.round(((now - start) / (end - start)) * 100);
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ContractCard({
  contract,
  role,
  onSign,
  onCancel,
  onReview,
  onRenew,
  onRespondCancel,
}: ContractCardProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("worker");
  const tc = useTranslations("common");

  const progress = getTimeProgress(contract.start_date, contract.end_date);
  const daysRemaining = getDaysRemaining(contract.end_date);

  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-[var(--shadow-card)]"
      )}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      layout
    >
      <div className="p-5">
        {/* Top row: status badge */}
        <div className="mb-3 flex items-start justify-between">
          <ContractStatusBadge status={contract.status} size="sm" />
          {contract.blockchain_hash && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {contract.blockchain_hash.slice(0, 10)}...
            </span>
          )}
        </div>

        {/* Company / Worker info */}
        <div className="mb-3 flex items-center gap-3">
          <CompanyAvatar
            letter={role === "worker" ? contract.company_letter : contract.worker_name.charAt(0)}
            gradient={contract.company_gradient}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold text-foreground">
              {role === "worker" ? contract.company_name : contract.worker_name}
            </p>
            <p className="truncate text-sm text-foreground">
              {contract.position}
            </p>
          </div>
        </div>

        {/* Details row */}
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {contract.city}, {contract.country}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {contract.start_date} - {contract.end_date}
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign className="size-3" />
            {contract.currency} ${contract.salary.toLocaleString()}{tc("misc.perMonth")}
          </span>
        </div>

        {/* Progress bar for active contracts */}
        {(contract.status === "activo" ||
          contract.status === "cancelacion_solicitada") && (
          <div className="mb-3">
            <ProgressBar
              value={progress}
              color={progress > 80 ? "warning" : "primary"}
              label={t("contracts.progress")}
              showPercentage
            />
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {t("contracts.daysRemaining", { count: daysRemaining })}
            </div>
          </div>
        )}

        {/* Expandable terms */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between rounded-lg border border-foreground/5 bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <span>{t("contracts.terms")}</span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="size-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-3 text-sm text-muted-foreground">
                <p>{contract.terms}</p>
                <div className="flex flex-wrap gap-1.5">
                  {contract.benefits.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                {contract.visa_sponsorship && (
                  <p className="text-xs font-medium text-emerald-600">
                    {t("contracts.visaSponsorship")}
                  </p>
                )}
                <p className="text-xs">
                  <span className="font-medium text-foreground">{t("contracts.schedule")}</span>{" "}
                  {contract.work_schedule}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Pendiente (worker): Sign button */}
          {contract.status === "pendiente" && role === "worker" && onSign && (
            <Button
              onClick={() => onSign(contract)}
              className="bg-brand-600 text-white hover:bg-brand-700"
              size="sm"
            >
              <FileSignature className="size-3.5" data-icon="inline-start" />
              {t("contracts.signDigitally")}
            </Button>
          )}

          {/* Pendiente (employer): waiting label */}
          {contract.status === "pendiente" && role === "employer" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
              <Clock className="size-3.5" />
              {t("contracts.awaitingSignature")}
            </span>
          )}

          {/* Activo: cancel + details */}
          {contract.status === "activo" && (
            <>
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(contract)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Ban className="size-3.5" data-icon="inline-start" />
                  {t("contracts.requestCancellation")}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Eye className="size-3.5" data-icon="inline-start" />
                {tc("actions.viewDetails")}
              </Button>
            </>
          )}

          {/* Cancelacion solicitada: respond */}
          {contract.status === "cancelacion_solicitada" && onRespondCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRespondCancel(contract)}
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {t("contracts.respondToRequest")}
            </Button>
          )}

          {/* Completado: review + download + renew */}
          {contract.status === "completado" && (
            <>
              {onReview && role === "worker" && (
                <Button
                  size="sm"
                  className="bg-brand-600 text-white hover:bg-brand-700"
                  onClick={() => onReview(contract)}
                >
                  <Star className="size-3.5" data-icon="inline-start" />
                  {t("reviews.leaveReview")}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="size-3.5" data-icon="inline-start" />
                {tc("actions.downloadPDF")}
              </Button>
              {onRenew && role === "employer" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRenew(contract)}
                  className="border-brand-200 text-brand-600 hover:bg-brand-50"
                >
                  <RefreshCw className="size-3.5" data-icon="inline-start" />
                  {t("contracts.renewContract")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
