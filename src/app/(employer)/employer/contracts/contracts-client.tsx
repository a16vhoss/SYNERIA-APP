"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileSignature,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ContractCard } from "@/components/shared/contracts/contract-card";
import { ContractCancelDialog } from "@/components/shared/contracts/contract-cancel-dialog";
import { CreateContractForm } from "@/components/employer/contracts/create-contract-form";
import { RenewContractForm } from "@/components/employer/contracts/renew-contract-form";
import {
  requestCancellation,
  respondToCancellation,
} from "@/lib/actions/contracts";
import type { ContractData, ContractStatus } from "@/lib/actions/contracts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ContractFilter =
  | "todos"
  | "activo"
  | "completado"
  | "pendiente"
  | "cancelado";

interface ContractsClientProps {
  initialContracts: ContractData[];
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

// filterTabs are defined inside the component to use translations

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ContractsClient({ initialContracts }: ContractsClientProps) {
  const t = useTranslations("employer");
  const tc = useTranslations("common");

  const filterTabs: { key: ContractFilter; label: string }[] = [
    { key: "todos", label: tc("all") },
    { key: "activo", label: t("contracts.manage.active") },
    { key: "completado", label: t("contracts.manage.completed") },
    { key: "pendiente", label: t("contracts.manage.pending") },
    { key: "cancelado", label: t("contracts.manage.cancelled") },
  ];

  const [contracts, setContracts] =
    useState<ContractData[]>(initialContracts);
  const [activeFilter, setActiveFilter] = useState<ContractFilter>("todos");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [renewingContract, setRenewingContract] =
    useState<ContractData | null>(null);
  const [cancelContract, setCancelContract] =
    useState<ContractData | null>(null);
  const [cancelMode, setCancelMode] = useState<"request" | "respond">(
    "request"
  );

  // Stats
  const stats = useMemo(() => {
    const activos = contracts.filter((c) => c.status === "activo").length;
    const completados = contracts.filter(
      (c) => c.status === "completado"
    ).length;
    const pendientes = contracts.filter(
      (c) => c.status === "pendiente"
    ).length;
    const cancelados = contracts.filter(
      (c) =>
        c.status === "cancelado" || c.status === "cancelacion_solicitada"
    ).length;
    return { activos, completados, pendientes, cancelados };
  }, [contracts]);

  // Filtered
  const filtered = useMemo(() => {
    if (activeFilter === "todos") return contracts;
    if (activeFilter === "cancelado") {
      return contracts.filter(
        (c) =>
          c.status === "cancelado" || c.status === "cancelacion_solicitada"
      );
    }
    return contracts.filter((c) => c.status === activeFilter);
  }, [contracts, activeFilter]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<ContractFilter, number> = {
      todos: contracts.length,
      activo: 0,
      completado: 0,
      pendiente: 0,
      cancelado: 0,
    };
    for (const c of contracts) {
      if (c.status === "activo") counts.activo++;
      else if (c.status === "completado") counts.completado++;
      else if (c.status === "pendiente") counts.pendiente++;
      else if (
        c.status === "cancelado" ||
        c.status === "cancelacion_solicitada"
      )
        counts.cancelado++;
    }
    return counts;
  }, [contracts]);

  // Handlers
  const handleRequestCancel = useCallback(
    async (contractId: string, reason: string) => {
      await requestCancellation(contractId, reason, "employer");
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                status: "cancelacion_solicitada" as ContractStatus,
                cancellation_reason: reason,
                cancellation_requested_by: "employer" as const,
              }
            : c
        )
      );
      toast.success(t("contracts.manage.cancelRequested"));
    },
    []
  );

  const handleRespondCancel = useCallback(
    async (contractId: string, accept: boolean) => {
      await respondToCancellation(contractId, accept);
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                status: (accept ? "cancelado" : "en_disputa") as ContractStatus,
              }
            : c
        )
      );
      toast.success(
        accept ? t("contracts.manage.cancelAccepted") : t("contracts.manage.inDispute")
      );
    },
    []
  );

  const handleContractCreated = useCallback((contract: ContractData) => {
    setContracts((prev) => [contract, ...prev]);
    setShowCreate(false);
    toast.success(t("contracts.create.success"));
  }, []);

  const handleContractRenewed = useCallback((contract: ContractData) => {
    setContracts((prev) => [contract, ...prev]);
    setRenewingContract(null);
    toast.success(t("contracts.manage.renewSent"));
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <PageHeader
        title={t("contracts.title")}
        subtitle={t("contracts.manage.subtitle")}
      >
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-brand-600 text-white hover:bg-brand-700"
          size="lg"
        >
          <Plus className="size-4" data-icon="inline-start" />
          {t("contracts.create.title")}
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileSignature}
          label={t("contracts.manage.active")}
          value={stats.activos}
          variant="default"
        />
        <StatCard
          icon={CheckCircle2}
          label={t("contracts.manage.completed")}
          value={stats.completados}
          variant="blue"
        />
        <StatCard
          icon={Clock}
          label={t("contracts.manage.pending")}
          value={stats.pendientes}
          variant="orange"
        />
        <StatCard
          icon={XCircle}
          label={t("contracts.manage.cancelled")}
          value={stats.cancelados}
          variant="red"
        />
      </div>

      {/* Filter Tabs */}
      <motion.div
        className="flex items-center gap-1 overflow-x-auto rounded-xl bg-card p-1 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tabCounts[tab.key]}
              </span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-brand-600"
                  layoutId="employerContractFilter"
                  style={{ zIndex: -1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Contract Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={FileSignature}
              title={t("contracts.title")}
              description={t("contracts.manage.emptyDescription")}
              action={
                activeFilter === "todos"
                  ? {
                      label: t("contracts.create.title"),
                      onClick: () => setShowCreate(true),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((contract, i) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: i * 0.06,
                      type: "spring" as const,
                      stiffness: 300,
                      damping: 25,
                    },
                  }}
                  layout
                >
                  <ContractCard
                    contract={contract}
                    role="employer"
                    onCancel={(c) => {
                      setCancelContract(c);
                      setCancelMode("request");
                    }}
                    onRespondCancel={(c) => {
                      setCancelContract(c);
                      setCancelMode("respond");
                    }}
                    onRenew={(c) => setRenewingContract(c)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Contract Modal */}
      <CreateContractForm
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleContractCreated}
      />

      {/* Renew Contract Modal */}
      <RenewContractForm
        open={!!renewingContract}
        onOpenChange={(v) => {
          if (!v) setRenewingContract(null);
        }}
        parentContract={renewingContract}
        onRenewed={handleContractRenewed}
      />

      {/* Cancel Dialog */}
      <ContractCancelDialog
        open={!!cancelContract}
        onOpenChange={(v) => {
          if (!v) setCancelContract(null);
        }}
        contract={cancelContract}
        mode={cancelMode}
        onRequestCancel={handleRequestCancel}
        onRespondCancel={handleRespondCancel}
      />
    </motion.div>
  );
}
