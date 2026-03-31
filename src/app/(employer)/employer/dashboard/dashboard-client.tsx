"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, UserCheck } from "lucide-react";

import { DashboardHeader } from "@/components/employer/dashboard-header";
import { DashboardStats } from "@/components/employer/dashboard-stats";
import { VacanciesTable } from "@/components/employer/vacancies-table";
import { CreateVacancyModal } from "@/components/employer/create-vacancy-modal";
import type { MockCompany, MockVacancy } from "@/lib/constants/mock-data";

interface EmployerDashboardClientProps {
  company: MockCompany;
  vacancies: MockVacancy[];
  stats: {
    activeVacancies: number;
    totalCandidates: number;
    inInterview: number;
    accepted: number;
  };
}

type TabKey = "vacantes" | "candidatos" | "aceptados";

export function EmployerDashboardClient({
  company,
  vacancies,
  stats,
}: EmployerDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("vacantes");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs: { key: TabKey; label: string; count: number; icon: React.ElementType }[] = [
    { key: "vacantes", label: "VACANTES", count: stats.activeVacancies, icon: Briefcase },
    { key: "candidatos", label: "CANDIDATOS", count: stats.totalCandidates, icon: Users },
    { key: "aceptados", label: "ACEPTADOS", count: stats.accepted, icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Green banner header */}
      <DashboardHeader companyName={company.name} verified={company.verified} />

      {/* Tab navigation */}
      <motion.div
        className="flex items-center gap-1 rounded-xl bg-card p-1 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Stats cards */}
      <DashboardStats
        activeVacancies={stats.activeVacancies}
        totalCandidates={stats.totalCandidates}
        inInterview={stats.inInterview}
        accepted={stats.accepted}
      />

      {/* Tab content */}
      {activeTab === "vacantes" && (
        <VacanciesTable
          vacancies={vacancies}
          onCreateVacancy={() => setShowCreateModal(true)}
        />
      )}

      {activeTab === "candidatos" && (
        <motion.div
          className="rounded-xl bg-card p-8 text-center shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Users className="mx-auto mb-3 size-10 text-brand-400" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Candidatos Recibidos
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui veras todos los candidatos que han aplicado a tus vacantes.
          </p>
        </motion.div>
      )}

      {activeTab === "aceptados" && (
        <motion.div
          className="rounded-xl bg-card p-8 text-center shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <UserCheck className="mx-auto mb-3 size-10 text-brand-400" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Candidatos Aceptados
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui veras los candidatos que has aceptado para tus vacantes.
          </p>
        </motion.div>
      )}

      {/* Create vacancy modal */}
      <CreateVacancyModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={(data) => {
          console.log("New vacancy:", data);
          // In production this would call a server action
        }}
      />
    </div>
  );
}
