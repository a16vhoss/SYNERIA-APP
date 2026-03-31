"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Search } from "lucide-react";
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
import { MOCK_APPLICATIONS } from "@/lib/constants/mock-data";
import type { InterviewData } from "@/lib/actions/applications";

type StatusFilter = "all" | "pending" | "reviewing" | "interview" | "accepted" | "rejected";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "Revisando" },
  { value: "interview", label: "Entrevista" },
  { value: "accepted", label: "Aceptada" },
  { value: "rejected", label: "Rechazada" },
];

const COMPANY_GRADIENTS: Record<string, "green" | "orange" | "purple" | "blue" | "teal" | "red"> = {
  "Constructora Alpha S.A.": "green",
  "Minera del Sur": "orange",
  "Volta SA": "purple",
  "PetroLatam": "blue",
  "AgroExport Ltda.": "teal",
};

// Mock interviews mapped by application id
const MOCK_INTERVIEWS: Record<string, InterviewData> = {
  app_002: {
    applicationId: "app_002",
    date: "2026-04-01",
    time: "10:00",
    videoLink: "https://meet.google.com/abc-defg-hij",
    notes: "Por favor tener disponible tu CV y documentos de identidad.",
    confirmed: null,
  },
};

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

export function ApplicationsClient() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<Record<string, InterviewData>>(MOCK_INTERVIEWS);

  useEffect(() => {
    // In production: fetch from server action
    setApplications([...MOCK_APPLICATIONS]);
  }, []);

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
    setInterviews((prev) => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        confirmed,
      },
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mis Aplicaciones" />

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
            <SelectValue placeholder="Filtrar por estado" />
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
          title="Sin aplicaciones"
          description="Aun no has enviado aplicaciones. Explora empleos disponibles."
          action={{
            label: "Explorar empleos",
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
                  Puesto
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Empresa
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fecha
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
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
                          letter={app.companyName.charAt(0)}
                          gradient={COMPANY_GRADIENTS[app.companyName] ?? "green"}
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
