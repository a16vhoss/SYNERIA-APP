"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  Clock,
} from "lucide-react";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { GlassCard } from "@/components/shared/glass-card";
import { VacancyStatusActions } from "@/components/employer/vacancy-status-actions";
import {
  EditVacancyModal,
  type EditVacancyFormData,
} from "@/components/employer/edit-vacancy-modal";
import {
  type MockVacancy,
  type MockCandidate,
} from "@/lib/constants/mock-data";
import { createClient } from "@/lib/supabase/client";
import { JOB_TYPES } from "@/lib/constants/countries";

// ── Animation variants ───────────────────────────────────────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// ── Detail block helper ──────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("employer");

  const [vacancy, setVacancy] = useState<MockVacancy | null>(null);
  const [candidates, setCandidates] = useState<MockCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        // Fetch vacancy
        const { data: vacancyData } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (vacancyData) {
          setVacancy({
            id: vacancyData.id,
            title: vacancyData.title ?? "",
            location: `${vacancyData.city ?? ""}, ${vacancyData.country ?? ""}`,
            country: vacancyData.country ?? "",
            city: vacancyData.city ?? "",
            sector: vacancyData.sector ?? "",
            contract_type: vacancyData.job_type ?? "full_time",
            salary_min: vacancyData.salary_min ?? null,
            salary_max: vacancyData.salary_max ?? null,
            description: vacancyData.description ?? "",
            status: (vacancyData.status as MockVacancy["status"]) ?? "active",
            applications_count: vacancyData.applications_count ?? 0,
            published_at: vacancyData.created_at ?? new Date().toISOString(),
            company_id: vacancyData.company_id ?? "",
          });

          // Fetch candidates (applications) for this vacancy
          const { data: candidatesData } = await supabase
            .from("applications")
            .select("*")
            .eq("job_id", id);

          setCandidates(
            (candidatesData ?? []).map((c: Record<string, unknown>) => ({
              id: c.id as string,
              name: (c.name as string) ?? (c.full_name as string) ?? "Candidato",
              email: (c.email as string) ?? "",
              avatar_url: (c.avatar_url as string) ?? null,
              role_applied: (c.role_applied as string) ?? "",
              vacancy_id: (c.vacancy_id as string) ?? id,
              status: (c.status as MockCandidate["status"]) ?? "pending",
              applied_at: (c.applied_at as string) ?? (c.created_at as string) ?? new Date().toISOString(),
              rating: (c.rating as number) ?? 0,
            }))
          );
        } else {
          setVacancy(null);
        }
      } catch {
        setVacancy(null);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function handleStatusChange(_id: string, newStatus: MockVacancy["status"]) {
    setVacancy((prev) => (prev ? { ...prev, status: newStatus } : null));
  }

  function handleEdit(_id: string, data: EditVacancyFormData) {
    setVacancy((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        sector: data.sector || prev.sector,
        contract_type: data.contract_type || prev.contract_type,
        country: data.country || prev.country,
        city: data.city || prev.city,
        location: `${data.city || prev.city}, ${data.country || prev.country}`,
        salary_min: data.salary_min ? Number(data.salary_min) : prev.salary_min,
        salary_max: data.salary_max ? Number(data.salary_max) : prev.salary_max,
      };
    });
    toast.success(t("vacancies.edit.success"));
  }

  function formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  }

  function getContractLabel(value: string) {
    return JOB_TYPES.find((j) => j.value === value)?.label ?? value;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!vacancy) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Briefcase className="mb-4 size-12 text-muted-foreground" />
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t("vacancies.notFound")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("vacancies.notFoundDescription")}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/vacancies")}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          {t("vacancies.backToList")}
        </Button>
      </motion.div>
    );
  }

  const salaryRange =
    vacancy.salary_min && vacancy.salary_max
      ? t("vacancies.salaryRange", { currency: "EUR", min: vacancy.salary_min.toLocaleString(), max: vacancy.salary_max.toLocaleString() })
      : vacancy.salary_min
        ? t("vacancies.salaryFrom", { currency: "EUR", amount: vacancy.salary_min.toLocaleString() })
        : vacancy.salary_max
          ? t("vacancies.salaryUpTo", { currency: "EUR", amount: vacancy.salary_max.toLocaleString() })
          : t("vacancies.salaryNotSpecified");

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Back link + header */}
      <motion.div variants={fadeUp}>
        <Link
          href="/vacancies"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t("vacancies.backToList")}
        </Link>

        <PageHeader title={vacancy.title}>
          <div className="flex items-center gap-2">
            <StatusBadge status={vacancy.status} size="lg" />
            <VacancyStatusActions
              vacancy={vacancy}
              onStatusChange={handleStatusChange}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" data-icon="inline-start" />
              {t("vacancies.edit.title")}
            </Button>
            <Link href={`/jobs/${vacancy.id}`} target="_blank">
              <Button size="sm" variant="ghost">
                <ExternalLink className="size-3.5" data-icon="inline-start" />
                {t("vacancies.viewAsCandidate")}
              </Button>
            </Link>
          </div>
        </PageHeader>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <motion.div className="space-y-6 lg:col-span-2" variants={fadeUp}>
          {/* Description card */}
          <GlassCard hover={false}>
            <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
              {t("vacancies.create.description")}
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {vacancy.description}
            </p>
          </GlassCard>

          {/* Detail cards */}
          <GlassCard hover={false}>
            <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
              {t("vacancies.details")}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                icon={MapPin}
                label={t("vacancies.create.location")}
                value={vacancy.location}
              />
              <DetailRow
                icon={Briefcase}
                label={t("vacancies.create.category")}
                value={vacancy.sector}
              />
              <DetailRow
                icon={FileText}
                label={t("vacancies.create.type")}
                value={getContractLabel(vacancy.contract_type)}
              />
              <DetailRow
                icon={DollarSign}
                label={t("vacancies.create.salary")}
                value={salaryRange}
              />
              <DetailRow
                icon={Calendar}
                label={t("dashboard.vacanciesTable.posted")}
                value={formatDate(vacancy.published_at)}
              />
              <DetailRow
                icon={Clock}
                label={t("vacancies.lastUpdated")}
                value={formatDate(vacancy.published_at)}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* Right: Sidebar */}
        <motion.div className="space-y-6" variants={fadeUp}>
          {/* Applications summary */}
          <GlassCard hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-foreground">
                {t("vacancies.applications")}
              </h3>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {vacancy.applications_count}
              </span>
            </div>

            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("vacancies.noCandidatesYet")}
              </p>
            ) : (
              <div className="space-y-3">
                {candidates.slice(0, 5).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-brand-50/50"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-brand-200 text-xs font-bold text-brand-700">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(candidate.applied_at)}
                      </p>
                    </div>
                    <StatusBadge status={candidate.status} size="sm" />
                  </div>
                ))}

                {candidates.length > 5 && (
                  <Link
                    href={`/employer/vacancies/${vacancy.id}/candidates`}
                    className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    {t("vacancies.viewAllCandidates", { count: candidates.length })}
                  </Link>
                )}
              </div>
            )}
          </GlassCard>

          {/* Quick stats */}
          <GlassCard hover={false}>
            <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
              {t("vacancies.summary")}
            </h3>
            <div className="space-y-3">
              <QuickStat
                label={t("candidates.pipeline.pending")}
                value={
                  candidates.filter((c) => c.status === "pending").length
                }
                color="text-amber-600 bg-amber-100"
              />
              <QuickStat
                label={t("candidates.pipeline.reviewing")}
                value={
                  candidates.filter((c) => c.status === "reviewing").length
                }
                color="text-sky-600 bg-sky-100"
              />
              <QuickStat
                label={t("candidates.pipeline.interview")}
                value={
                  candidates.filter((c) => c.status === "interview").length
                }
                color="text-violet-600 bg-violet-100"
              />
              <QuickStat
                label={t("candidates.pipeline.accepted")}
                value={
                  candidates.filter((c) => c.status === "accepted").length
                }
                color="text-emerald-600 bg-emerald-100"
              />
              <QuickStat
                label={t("candidates.pipeline.rejected")}
                value={
                  candidates.filter((c) => c.status === "rejected").length
                }
                color="text-rose-600 bg-rose-100"
              />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Edit modal */}
      <EditVacancyModal
        open={editOpen}
        onOpenChange={setEditOpen}
        vacancy={vacancy}
        onSubmit={handleEdit}
      />
    </motion.div>
  );
}

// ── Quick stat helper ────────────────────────────────────────────────
function QuickStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
          color
        )}
      >
        {value}
      </span>
    </div>
  );
}
