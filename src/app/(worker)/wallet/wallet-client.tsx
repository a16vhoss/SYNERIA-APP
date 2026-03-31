"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSignature,
  CheckCircle2,
  Clock,
  Wallet,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ContractCard } from "@/components/shared/contracts/contract-card";
import { ContractSignDialog } from "@/components/shared/contracts/contract-sign-dialog";
import { ContractCancelDialog } from "@/components/shared/contracts/contract-cancel-dialog";
import {
  signContract,
  requestCancellation,
  respondToCancellation,
} from "@/lib/actions/contracts";
import type { ContractData, ContractStatus } from "@/lib/actions/contracts";

/* Wallet tab components */
import { BalanceCard } from "@/components/worker/wallet/balance-card";
import { QuickActions } from "@/components/worker/wallet/quick-actions";
import { TransactionList } from "@/components/worker/wallet/transaction-list";
import { WalletCardVisual } from "@/components/worker/wallet/wallet-card-visual";
import { ConnectedAccounts } from "@/components/worker/wallet/connected-accounts";
import { FinancialStats } from "@/components/worker/wallet/financial-stats";
import { RemittanceModal } from "@/components/worker/wallet/remittance-modal";
import { CurrencySwapModal } from "@/components/worker/wallet/currency-swap-modal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MainTab = "wallet" | "contratos";
type ContractFilter = "todos" | "activo" | "completado" | "pendiente";

interface WalletClientProps {
  initialContracts: ContractData[];
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const mainTabs: { key: MainTab; label: string }[] = [
  { key: "wallet", label: "Wallet" },
  { key: "contratos", label: "Contratos" },
];

const contractTabs: { key: ContractFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "activo", label: "Activos" },
  { key: "completado", label: "Completados" },
  { key: "pendiente", label: "Pendientes" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WalletClient({ initialContracts }: WalletClientProps) {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("wallet");

  /* Wallet modals */
  const [remittanceOpen, setRemittanceOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [contractFilter, setContractFilter] =
    useState<ContractFilter>("todos");
  const [contracts, setContracts] =
    useState<ContractData[]>(initialContracts);

  // Dialogs
  const [signingContract, setSigningContract] =
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
    return { activos, completados, pendientes };
  }, [contracts]);

  // Filtered contracts
  const filtered = useMemo(() => {
    if (contractFilter === "todos") return contracts;
    return contracts.filter((c) => c.status === contractFilter);
  }, [contracts, contractFilter]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<ContractFilter, number> = {
      todos: contracts.length,
      activo: 0,
      completado: 0,
      pendiente: 0,
    };
    for (const c of contracts) {
      if (c.status in counts) {
        counts[c.status as Exclude<ContractFilter, "todos">]++;
      }
    }
    return counts;
  }, [contracts]);

  // Handlers
  const handleSign = useCallback(
    async (contractId: string, signatureData: string) => {
      const result = await signContract(contractId, signatureData);
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                status: "activo" as ContractStatus,
                blockchain_hash: result.hash,
                signed_at: result.signedAt,
                signature_worker: "signed",
              }
            : c
        )
      );
      toast.success("Contrato firmado exitosamente");
      return result;
    },
    []
  );

  const handleRequestCancel = useCallback(
    async (contractId: string, reason: string) => {
      await requestCancellation(contractId, reason, "worker");
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                status: "cancelacion_solicitada" as ContractStatus,
                cancellation_reason: reason,
                cancellation_requested_by: "worker" as const,
              }
            : c
        )
      );
      toast.success("Solicitud de cancelacion enviada");
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
        accept ? "Cancelacion aceptada" : "Contrato en disputa"
      );
    },
    []
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <PageHeader
        title="Wallet & Contratos"
        subtitle="Gestiona tus finanzas, envios y firma contratos digitalmente"
      />

      {/* Main Tab Bar */}
      <motion.div
        className="flex items-center gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {mainTabs.map((tab) => {
          const isActive = activeMainTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveMainTab(tab.key)}
              className={cn(
                "relative flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="relative z-10">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-brand-600"
                  layoutId="mainTab"
                  style={{ zIndex: 0 }}
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeMainTab === "wallet" && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="space-y-8"
          >
            {/* Balance Card */}
            <BalanceCard
              onSendMoney={() => setRemittanceOpen(true)}
              onReceive={() => toast.info("Comparte tu ID de wallet para recibir pagos")}
            />

            {/* Quick Actions */}
            <QuickActions
              onAction={(id) => {
                if (id === "remesas") setRemittanceOpen(true);
                else if (id === "cambio") setSwapOpen(true);
                else toast.info("Funcion disponible proximamente");
              }}
            />

            {/* Transactions */}
            <TransactionList />

            {/* Cards & Accounts */}
            <div>
              <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
                Tarjetas & Cuentas
              </h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col items-center gap-3">
                  <WalletCardVisual />
                  <span className="text-xs text-muted-foreground">
                    Solicitar Tarjeta Fisica
                  </span>
                </div>
                <ConnectedAccounts />
              </div>
            </div>

            {/* Financial Stats */}
            <FinancialStats />

            {/* Modals */}
            <RemittanceModal
              open={remittanceOpen}
              onOpenChange={setRemittanceOpen}
            />
            <CurrencySwapModal
              open={swapOpen}
              onOpenChange={setSwapOpen}
            />
          </motion.div>
        )}

        {activeMainTab === "contratos" && (
          <motion.div
            key="contratos"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                icon={FileSignature}
                label="Contratos Activos"
                value={stats.activos}
                variant="default"
              />
              <StatCard
                icon={CheckCircle2}
                label="Completados"
                value={stats.completados}
                variant="blue"
              />
              <StatCard
                icon={Clock}
                label="Pendientes de Firma"
                value={stats.pendientes}
                variant="orange"
              />
            </div>

            {/* Filter Tabs */}
            <motion.div
              className="flex items-center gap-1 overflow-x-auto rounded-xl bg-card p-1 shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {contractTabs.map((tab) => {
                const isActive = contractFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setContractFilter(tab.key)}
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
                        layoutId="contractFilter"
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

            {/* Title */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Mis Contratos
              </h2>
              <span className="text-sm text-muted-foreground">
                {filtered.length} contrato(s)
              </span>
            </div>

            {/* Contract Cards */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={FileSignature}
                title="Sin contratos"
                description="No tienes contratos en esta categoria."
              />
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
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
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <ContractCard
                        contract={contract}
                        role="worker"
                        onSign={(c) => setSigningContract(c)}
                        onCancel={(c) => {
                          setCancelContract(c);
                          setCancelMode("request");
                        }}
                        onRespondCancel={(c) => {
                          setCancelContract(c);
                          setCancelMode("respond");
                        }}
                        onReview={() => {
                          toast.info(
                            "Sistema de resenas disponible proximamente"
                          );
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Dialog */}
      <ContractSignDialog
        open={!!signingContract}
        onOpenChange={(v) => {
          if (!v) setSigningContract(null);
        }}
        contract={signingContract}
        onSign={handleSign}
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
