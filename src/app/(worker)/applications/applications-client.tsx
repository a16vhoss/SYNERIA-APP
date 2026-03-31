"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { InterviewCard } from "@/components/worker/interview-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { MockApplication } from "@/lib/constants/mock-data";
import type { InterviewData } from "@/lib/actions/applications";
import { respondToInterview } from "@/lib/actions/applications";

type StatusFilter = "all" | "pending" | "reviewing" | "interview" | "accepted" | "rejected";

const GRADIENT_MAP: Record<string, "green" | "orange" | "purple" | "blue" | "teal" | "red"> = {
  green: "green",
  orange: "orange",
  purple: "purple",
  blue: "blue",
  teal: "teal",
  red: "red",
};

function resolveGradient(app: MockApplication): "green" | "orange" | "purple" | "blue" | "teal" | "red" {
  // Use real logo_gradient from Supabase if available (attached as _logoGradient)
  const extra = app as MockApplication & { _logoGradient?: string };
  if (extra._logoGradient && GRADIENT_MAP[extra._logoGradient]) {
    return GRADIENT_MAP[extra._logoGradient];
  }
  // Fallback: derive from company name hash
  const gradients: ("green" | "orange" | "purple" | "blue" | "teal" | "red")[] = [
    "green", "orange", "purple", "blue", "teal", "red",
  ];
  let hash = 0;
  for (let i = 0; i < app.companyName.length; i++) {
    hash = app.companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function resolveLetter(app: MockApplication): string {
  const extra = app as MockApplication & { _logoLetter?: string };
  return extra._logoLetter ?? app.companyName.charAt(0);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  }),
};

interface ApplicationsClientProps {
  initialApplications: MockApplication[];
  initialInterviews: Record<string, InterviewData>;
}

export function ApplicationsClient({
  initialApplications,
  initialInterviews,
}: ApplicationsClientProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const router = useRouter();

  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: tc("misc.all") },
    { value: "pending", label: tc("status.pending") },
    { value: "reviewing", label: tc("status.reviewing") },
    { value: "interview", label: tc("status.interview") },
    { value: "accepted", label: tc("status.accepted") },
    { value: "rejected", label: tc("status.rejected") },
  ];
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [applications] = useState<MockApplication[]>(initialApplications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<Record<string, InterviewData>>(initialInterviews);
  const [isPending, startTransition] = useTransition();

  const filtered =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  function handleRowClick(app: MockApplication) {
    if (app.status === "interview") {
      setExpandedId((prev) => (prev === app.id ? null : app.id));
    } else {
      router.push(`/jobs/${app.jobId}`);
    }
  }

  function handleInterviewResponse(applicationId: string, confirmed: boolean) {
    // Optimistic update
    setInterviews((prev) => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        confirmed,
      },
    }));

    // Persist to Supabase via server action
    startTransition(async () => {
      try {
        await respondToInterview(applicationId, confirmed);
      } catch (err) {
        console.error("Failed to update interview response:", err);
        // Revert optimistic update on error
        setInterviews((prev) => ({
          ...prev,
          [applicationId]: {
            ...prev[applicationId],
            confirmed: null,
          },
        }));
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("applications.title")} />

      {/* Filters */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Select
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={tc("actions.filter")} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={tc("empty.noApplications")}
          description={t("applications.empty")}
          action={{
            label: t("applications.emptyAction"),
            onClick: () => router.push("/jobs"),
          }}
        />
      ) : (
        <motion.div
          className="overflow-hidden rounded-xl border border-white/20 bg-white/60 backdrop-blur-md shadow-[var(--shadow-card)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("applications.table.position")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("applications.table.company")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("applications.table.date")}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("applications.table.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filtered.map((app, i) => (
                  <motion.tr
                    key={app.id}
                    className="group cursor-pointer border-b transition-colors hover:bg-brand-50/30"
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    custom={i}
                    layout
                    onClick={() => handleRowClick(app)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {app.jobTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CompanyAvatar
                          letter={resolveLetter(app)}
                          gradient={resolveGradient(app)}
                          size="sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          {app.companyName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(app.appliedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} size="sm" />
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {/* Expanded interview details */}
          <AnimatePresence>
            {expandedId && interviews[expandedId] && (
              <motion.div
                key={`interview-${expandedId}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="overflow-hidden border-t"
              >
                <div className="p-4">
                  <InterviewCard
                    companyName={
                      applications.find((a) => a.id === expandedId)
                        ?.companyName ?? ""
                    }
                    jobTitle={
                      applications.find((a) => a.id === expandedId)
                        ?.jobTitle ?? ""
                    }
                    interview={interviews[expandedId]}
                    onConfirm={() =>
                      handleInterviewResponse(expandedId, true)
                    }
                    onDecline={() =>
                      handleInterviewResponse(expandedId, false)
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
