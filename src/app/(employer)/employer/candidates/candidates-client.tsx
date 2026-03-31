"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { CandidateCard } from "@/components/employer/candidate-card";
import { InterviewScheduleModal } from "@/components/employer/interview-schedule-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { MockCandidate } from "@/lib/constants/mock-data";
import { updateApplicationStatus } from "@/lib/actions/applications";

type StatusFilter = "all" | "pending" | "reviewing" | "interview" | "accepted" | "rejected";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

interface CandidatesClientProps {
  initialCandidates?: MockCandidate[];
  vacancies?: { id: string; title: string }[];
}

export function CandidatesClient({ initialCandidates, vacancies = [] }: CandidatesClientProps = {}) {
  const t = useTranslations("employer");
  const tc = useTranslations("common");
  const [candidates, setCandidates] = useState<MockCandidate[]>(initialCandidates ?? []);
  const [vacancyFilter, setVacancyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [scheduleTarget, setScheduleTarget] = useState<MockCandidate | null>(null);

  const filtered = useMemo(() => {
    let result = candidates;

    if (vacancyFilter !== "all") {
      result = result.filter((c) => c.vacancy_id === vacancyFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role_applied.toLowerCase().includes(q)
      );
    }

    return result;
  }, [candidates, vacancyFilter, statusFilter, search]);

  async function handleStatusChange(candidateId: string, newStatus: MockCandidate["status"]) {
    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
    try {
      await updateApplicationStatus(candidateId, newStatus);
      toast.success(
        newStatus === "accepted"
          ? t("candidates.actions.accept")
          : newStatus === "rejected"
            ? t("candidates.actions.reject")
            : tc("updated")
      );
    } catch {
      // Rollback on error
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: "pending" } : c))
      );
      toast.error(tc("error"));
    }
  }

  function handleScheduleInterview(candidate: MockCandidate) {
    setScheduleTarget(candidate);
  }

  function handleScheduleSubmit() {
    if (scheduleTarget) {
      handleStatusChange(scheduleTarget.id, "interview");
    }
    setScheduleTarget(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("candidates.title")}
        subtitle={`${candidates.length} ${t("dashboard.stats.totalCandidates").toLowerCase()}`}
      />

      {/* Filters */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <SearchInput
          placeholder={t("candidates.filters.search")}
          value={search}
          onChange={setSearch}
          className="sm:max-w-xs"
        />

        <Select
          value={vacancyFilter}
          onValueChange={(v) => v && setVacancyFilter(v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t("candidates.filters.vacancy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("candidates.filters.vacancy")}</SelectItem>
            {vacancies.map((vac) => (
              <SelectItem key={vac.id} value={vac.id}>
                {vac.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("candidates.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("candidates.filters.status")}</SelectItem>
            <SelectItem value="pending">{t("candidates.pipeline.applied")}</SelectItem>
            <SelectItem value="reviewing">{t("candidates.pipeline.screening")}</SelectItem>
            <SelectItem value="interview">{t("candidates.pipeline.interview")}</SelectItem>
            <SelectItem value="accepted">{t("candidates.pipeline.hired")}</SelectItem>
            <SelectItem value="rejected">{t("candidates.pipeline.rejected")}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Candidates Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("candidates.title")}
          description={t("candidates.filters.search")}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((candidate) => (
              <motion.div
                key={candidate.id}
                variants={cardVariants}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <CandidateCard
                  candidate={candidate}
                  onStatusChange={(status) =>
                    handleStatusChange(candidate.id, status)
                  }
                  onScheduleInterview={() =>
                    handleScheduleInterview(candidate)
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Schedule Interview Modal */}
      <InterviewScheduleModal
        open={scheduleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setScheduleTarget(null);
        }}
        candidateName={scheduleTarget?.name ?? ""}
        onSchedule={handleScheduleSubmit}
      />
    </div>
  );
}
