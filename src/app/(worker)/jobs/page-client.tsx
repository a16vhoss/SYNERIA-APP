"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { JobCard, type JobData } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { JobFilters } from "@/components/worker/job-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MOCK_JOBS, MOCK_VACANCIES } from "@/lib/constants/mock-data";
import { COUNTRIES } from "@/lib/constants/countries";

/* ------------------------------------------------------------------ */
/*  Build a unified list of searchable jobs from both mock sources     */
/* ------------------------------------------------------------------ */

const GRADIENT_CYCLE: JobData["companyGradient"][] = [
  "green",
  "orange",
  "purple",
  "blue",
  "red",
  "teal",
];

function vacancyToJobData(v: (typeof MOCK_VACANCIES)[number], idx: number): JobData {
  return {
    id: v.id,
    companyName: "Tech Employer Test",
    companyLetter: "T",
    companyGradient: GRADIENT_CYCLE[idx % GRADIENT_CYCLE.length],
    title: v.title,
    location: v.location,
    salary: v.salary_min
      ? `$${v.salary_min.toLocaleString()}/mes`
      : "A convenir",
    tags: [],
    _sector: v.sector,
    _country: v.country,
    _contractType: v.contract_type,
    _salaryNum: v.salary_min ?? 0,
    _publishedAt: v.published_at,
  } as JobData & Record<string, unknown>;
}

type EnrichedJob = JobData & {
  _sector?: string;
  _country?: string;
  _contractType?: string;
  _salaryNum?: number;
  _publishedAt?: string;
};

function enrichMockJob(j: JobData): EnrichedJob {
  const salaryNum = parseInt(j.salary.replace(/[^0-9]/g, ""), 10) || 0;
  // Derive country from location text
  const locationLower = j.location.toLowerCase();
  let countryCode = "";
  if (locationLower.includes("chile")) countryCode = "CL";
  else if (locationLower.includes("peru")) countryCode = "PE";
  else if (locationLower.includes("colombia")) countryCode = "CO";

  // Derive sector from tags/title
  let sector = "";
  const titleLower = j.title.toLowerCase();
  if (titleLower.includes("construc")) sector = "Construccion";
  else if (titleLower.includes("maquinaria") || titleLower.includes("operador"))
    sector = "Construccion";
  else if (titleLower.includes("electric")) sector = "Energia";
  else if (titleLower.includes("agricol") || titleLower.includes("agro"))
    sector = "Agricultura";
  else if (titleLower.includes("solda")) sector = "Manufactura";

  return {
    ...j,
    _sector: sector,
    _country: countryCode,
    _contractType: "full_time",
    _salaryNum: salaryNum,
    _publishedAt: "2026-03-20",
  };
}

const ALL_JOBS: EnrichedJob[] = [
  ...MOCK_JOBS.map(enrichMockJob),
  ...MOCK_VACANCIES.map((v, i) => vacancyToJobData(v, i) as EnrichedJob),
];

const ITEMS_PER_PAGE = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function JobsPageClient() {
  const router = useRouter();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [country, setCountry] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [salaryMin, setSalaryMin] = useState("0");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Computed filtered results
  const filtered = useMemo(() => {
    let result = [...ALL_JOBS];

    // Text search
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q)
      );
    }

    // Sector filter
    if (sector && sector !== "all") {
      result = result.filter((j) => j._sector === sector);
    }

    // Country filter
    if (country && country !== "all") {
      result = result.filter((j) => j._country === country);
    }

    // Job type filter
    if (jobType && jobType !== "all") {
      result = result.filter((j) => j._contractType === jobType);
    }

    // Salary min filter
    const minSalary = parseInt(salaryMin, 10) || 0;
    if (minSalary > 0) {
      result = result.filter((j) => (j._salaryNum ?? 0) >= minSalary);
    }

    // Sort
    if (sortBy === "salary") {
      result.sort((a, b) => (b._salaryNum ?? 0) - (a._salaryNum ?? 0));
    } else {
      result.sort((a, b) =>
        (b._publishedAt ?? "").localeCompare(a._publishedAt ?? "")
      );
    }

    return result;
  }, [debouncedQuery, sector, country, jobType, salaryMin, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function clearFilters() {
    setSector("all");
    setCountry("all");
    setJobType("all");
    setSalaryMin("0");
    setSearchQuery("");
    setPage(1);
  }

  const toggleSave = useCallback((jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader title="Busqueda de Empleos" />

      {/* Search bar */}
      <SearchInput
        placeholder="Buscar por titulo, empresa o ubicacion..."
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={() => {}}
        showButton
        buttonLabel="Buscar"
      />

      {/* Filters */}
      <JobFilters
        sector={sector}
        country={country}
        jobType={jobType}
        salaryMin={salaryMin}
        onSectorChange={(v) => { setSector(v); setPage(1); }}
        onCountryChange={(v) => { setCountry(v); setPage(1); }}
        onJobTypeChange={(v) => { setJobType(v); setPage(1); }}
        onSalaryMinChange={(v) => { setSalaryMin(v); setPage(1); }}
        onClearFilters={clearFilters}
      />

      {/* Results header: count + sort */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          empleos encontrados
        </span>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v); }}>
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mas reciente</SelectItem>
              <SelectItem value="salary">Mayor salario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Job grid or empty state */}
      {paged.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {paged.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                isSaved={savedJobs.has(job.id)}
                onSave={toggleSave}
                onApply={(id) => router.push(`/jobs/${id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Sin resultados"
          description="No se encontraron empleos que coincidan con tus filtros. Intenta ajustar los criterios de busqueda."
          action={{
            label: "Limpiar filtros",
            onClick: clearFilters,
            variant: "outline",
          }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-2 pt-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(i + 1)}
              className="min-w-8"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
