"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Briefcase,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { VacancyStats } from "@/components/employer/vacancy-stats";
import { VacancyStatusActions } from "@/components/employer/vacancy-status-actions";
import { CreateVacancyModal } from "@/components/employer/create-vacancy-modal";
import {
  EditVacancyModal,
  type EditVacancyFormData,
} from "@/components/employer/edit-vacancy-modal";
import { createJob, updateJob, updateJobStatus, deleteJob } from "@/lib/actions/jobs";
import type { MockVacancy } from "@/lib/constants/mock-data";

// ── Types ────────────────────────────────────────────────────────────
type SortField =
  | "title"
  | "location"
  | "applications_count"
  | "status"
  | "published_at";
type SortDirection = "asc" | "desc";
type TabFilter = "all" | "active" | "paused" | "closed" | "draft";

interface VacanciesClientProps {
  initialVacancies: MockVacancy[];
}

// ── Tab definitions ──────────────────────────────────────────────────
const tabs: { key: TabFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "paused", label: "Pausadas" },
  { key: "closed", label: "Cerradas" },
  { key: "draft", label: "Borradores" },
];

// ── Row animation ────────────────────────────────────────────────────
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
};

// ── Component ────────────────────────────────────────────────────────
export function VacanciesClient({
  initialVacancies,
}: VacanciesClientProps) {
  // State
  const [vacancies, setVacancies] = useState<MockVacancy[]>(initialVacancies);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("published_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<MockVacancy | null>(
    null
  );

  // ── Filtering + sorting ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...vacancies];

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((v) => v.status === activeTab);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q) ||
          v.sector.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "location":
          cmp = a.location.localeCompare(b.location);
          break;
        case "applications_count":
          cmp = a.applications_count - b.applications_count;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "published_at":
          cmp =
            new Date(a.published_at).getTime() -
            new Date(b.published_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [vacancies, search, sortField, sortDir, activeTab]);

  // ── Tab counts ─────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Record<TabFilter, number> = {
      all: vacancies.length,
      active: 0,
      paused: 0,
      closed: 0,
      draft: 0,
    };
    for (const v of vacancies) {
      if (v.status in counts) {
        counts[v.status as Exclude<TabFilter, "all">]++;
      }
    }
    return counts;
  }, [vacancies]);

  // ── Handlers ───────────────────────────────────────────────────────
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const handleStatusChange = useCallback(
    (id: string, newStatus: MockVacancy["status"]) => {
      setVacancies((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
      );
    },
    []
  );

  async function handleCreate(data: Record<string, unknown>) {
    try {
      const newVacancy = await createJob({
        title: (data.title as string) ?? "",
        description: (data.description as string) ?? "",
        sector: (data.sector as string) ?? "",
        contract_type: (data.contractType as string) ?? (data.contract_type as string) ?? "full_time",
        country: (data.country as string) ?? "",
        city: (data.city as string) ?? "",
        salary_min: data.salaryMin?.toString() ?? data.salary_min?.toString(),
        salary_max: data.salaryMax?.toString() ?? data.salary_max?.toString(),
        requirements: (data.requirements as string) ?? "",
        benefits: (data.benefits as string) ?? "",
      });
      setVacancies((prev) => [newVacancy, ...prev]);
      toast.success("Vacante publicada correctamente");
    } catch {
      toast.error("Error al crear la vacante");
    }
  }

  function handleEdit(id: string, data: EditVacancyFormData) {
    setVacancies((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        return {
          ...v,
          title: data.title || v.title,
          description: data.description || v.description,
          sector: data.sector || v.sector,
          contract_type: data.contract_type || v.contract_type,
          country: data.country || v.country,
          city: data.city || v.city,
          location: `${data.city || v.city}, ${data.country || v.country}`,
          salary_min: data.salary_min ? Number(data.salary_min) : v.salary_min,
          salary_max: data.salary_max ? Number(data.salary_max) : v.salary_max,
        };
      })
    );
    toast.success("Vacante actualizada correctamente");
  }

  function handleDelete(id: string) {
    setVacancies((prev) => prev.filter((v) => v.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Vacante eliminada");
  }

  // ── Bulk actions ───────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((v) => v.id)));
    }
  }

  function bulkPause() {
    setVacancies((prev) =>
      prev.map((v) =>
        selected.has(v.id) && v.status === "active"
          ? { ...v, status: "paused" as const }
          : v
      )
    );
    toast.success(`${selected.size} vacante(s) pausada(s)`);
    setSelected(new Set());
  }

  function bulkClose() {
    setVacancies((prev) =>
      prev.map((v) =>
        selected.has(v.id) ? { ...v, status: "closed" as const } : v
      )
    );
    toast.success(`${selected.size} vacante(s) cerrada(s)`);
    setSelected(new Set());
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  }

  const SortableHead = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-white"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="size-3 opacity-60" />
      </button>
    </TableHead>
  );

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <PageHeader
        title="Gestion de Vacantes"
        subtitle="Administra todas tus publicaciones de empleo"
      >
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-brand-600 text-white hover:bg-brand-700"
          size="lg"
        >
          <Plus className="size-4" data-icon="inline-start" />
          Publicar Nueva Vacante
        </Button>
      </PageHeader>

      {/* Stats */}
      <VacancyStats vacancies={vacancies} />

      {/* Tabs */}
      <motion.div
        className="flex items-center gap-1 overflow-x-auto rounded-xl bg-card p-1 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setSelected(new Set());
              }}
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
                  layoutId="activeTab"
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

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-200"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
          >
            <span className="text-sm font-medium text-brand-700">
              {selected.size} seleccionada(s)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                onClick={bulkPause}
              >
                Pausar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={bulkClose}
              >
                Cerrar
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={() => setSelected(new Set())}
            >
              Cancelar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar vacante por titulo, ubicacion o sector..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </motion.div>

      {/* Table */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No hay vacantes"
              description={
                search || activeTab !== "all"
                  ? "No se encontraron vacantes con los filtros aplicados."
                  : "Aun no has publicado ninguna vacante. Crea tu primera vacante para empezar a recibir candidatos."
              }
              action={
                !search && activeTab === "all"
                  ? {
                      label: "Publicar Vacante",
                      onClick: () => setShowCreate(true),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-[var(--shadow-card)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-0 bg-brand-800 hover:bg-brand-800">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          filtered.length > 0 &&
                          selected.size === filtered.length
                        }
                        onCheckedChange={toggleSelectAll}
                        className="border-white/40 data-checked:border-white data-checked:bg-white data-checked:text-brand-800"
                      />
                    </TableHead>
                    <SortableHead field="title" className="text-white">
                      Titulo
                    </SortableHead>
                    <SortableHead field="location" className="text-white">
                      Ubicacion
                    </SortableHead>
                    <SortableHead
                      field="applications_count"
                      className="text-white"
                    >
                      Aplicaciones
                    </SortableHead>
                    <SortableHead field="status" className="text-white">
                      Estado
                    </SortableHead>
                    <SortableHead
                      field="published_at"
                      className="text-white"
                    >
                      Publicada
                    </SortableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-white/90">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((vacancy, i) => (
                      <motion.tr
                        key={vacancy.id}
                        className={cn(
                          "border-b border-foreground/5 transition-colors hover:bg-brand-50/50",
                          i % 2 === 1 && "bg-cream-light/40",
                          selected.has(vacancy.id) && "bg-brand-50/80"
                        )}
                        variants={rowVariants}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20 }}
                        layout
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.has(vacancy.id)}
                            onCheckedChange={() =>
                              toggleSelect(vacancy.id)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/vacancies/${vacancy.id}`}
                            className="font-medium text-foreground hover:text-brand-600 hover:underline"
                          >
                            {vacancy.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {vacancy.sector}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vacancy.location}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {vacancy.applications_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={vacancy.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(vacancy.published_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => setEditingVacancy(vacancy)}
                              title="Editar"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Link href={`/vacancies/${vacancy.id}`}>
                              <Button
                                size="icon-xs"
                                variant="ghost"
                                title="Ver detalle"
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            </Link>
                            <VacancyStatusActions
                              vacancy={vacancy}
                              onStatusChange={handleStatusChange}
                            />
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(vacancy.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create modal */}
      <CreateVacancyModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreate}
      />

      {/* Edit modal */}
      <EditVacancyModal
        open={!!editingVacancy}
        onOpenChange={(open) => {
          if (!open) setEditingVacancy(null);
        }}
        vacancy={editingVacancy}
        onSubmit={handleEdit}
      />
    </motion.div>
  );
}
