"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, ArrowUpDown, Pause, Play } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { MockVacancy } from "@/lib/constants/mock-data";

type SortField = "title" | "location" | "applications_count" | "status" | "published_at";
type SortDirection = "asc" | "desc";

interface VacanciesTableProps {
  vacancies: MockVacancy[];
  onCreateVacancy: () => void;
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, type: "spring" as const, stiffness: 300, damping: 25 },
  }),
};

export function VacanciesTable({ vacancies, onCreateVacancy }: VacanciesTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("published_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [localVacancies, setLocalVacancies] = useState(vacancies);

  const filtered = useMemo(() => {
    let result = [...localVacancies];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Search filter
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
          cmp = new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [localVacancies, search, sortField, sortDir, statusFilter]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function toggleStatus(id: string) {
    setLocalVacancies((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: v.status === "active" ? "paused" as const : "active" as const }
          : v
      )
    );
  }

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

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 24 }}
    >
      {/* Section header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Mis Vacantes
        </h2>
        <Button
          onClick={onCreateVacancy}
          className="bg-brand-600 text-white hover:bg-brand-700"
          size="lg"
        >
          <Plus className="size-4" data-icon="inline-start" />
          Publicar Nueva Vacante
        </Button>
      </div>

      {/* Search + Filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar vacante..."
            value={search}
            onChange={setSearch}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
          <option value="closed">Cerrado</option>
          <option value="draft">Borrador</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No hay vacantes"
          description={
            search || statusFilter !== "all"
              ? "No se encontraron vacantes con los filtros aplicados."
              : "Aun no has publicado ninguna vacante. Crea tu primera vacante para empezar a recibir candidatos."
          }
          action={
            !search && statusFilter === "all"
              ? { label: "Publicar Vacante", onClick: onCreateVacancy }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-[var(--shadow-card)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 bg-brand-800 hover:bg-brand-800">
                <SortableHead field="title" className="text-white">
                  Titulo del Puesto
                </SortableHead>
                <SortableHead field="location" className="text-white">
                  Ubicacion
                </SortableHead>
                <SortableHead field="applications_count" className="text-white">
                  Aplicaciones
                </SortableHead>
                <SortableHead field="status" className="text-white">
                  Estado
                </SortableHead>
                <SortableHead field="published_at" className="text-white">
                  Fecha Publicacion
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
                      i % 2 === 1 && "bg-cream-light/40"
                    )}
                    variants={rowVariants}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <TableCell className="font-medium text-foreground">
                      {vacancy.title}
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
                      <StatusBadge
                        status={vacancy.status === "active" ? "active" : "paused"}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(vacancy.published_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/employer/vacancies/${vacancy.id}/edit`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Editar
                        </Link>
                        <Button
                          size="xs"
                          variant="outline"
                          className={cn(
                            "text-xs",
                            vacancy.status === "active"
                              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100"
                          )}
                          onClick={() => toggleStatus(vacancy.id)}
                        >
                          {vacancy.status === "active" ? (
                            <>
                              <Pause className="size-3" data-icon="inline-start" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="size-3" data-icon="inline-start" />
                              Activar
                            </>
                          )}
                        </Button>
                        <Link
                          href={`/employer/vacancies/${vacancy.id}/candidates`}
                          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Ver Candids
                        </Link>
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
  );
}
