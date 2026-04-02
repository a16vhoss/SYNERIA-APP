"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, SECTORS, JOB_TYPES } from "@/lib/constants/countries";

const SALARY_RANGES = [
  { value: "0", label: "__all__" },
  { value: "1000", label: "$1,000+" },
  { value: "2000", label: "$2,000+" },
  { value: "3000", label: "$3,000+" },
  { value: "4000", label: "$4,000+" },
  { value: "5000", label: "$5,000+" },
] as const;

interface JobFiltersProps {
  sector: string;
  country: string;
  jobType: string;
  salaryMin: string;
  onSectorChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onSalaryMinChange: (value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export function JobFilters({
  sector,
  country,
  jobType,
  salaryMin,
  onSectorChange,
  onCountryChange,
  onJobTypeChange,
  onSalaryMinChange,
  onClearFilters,
  className,
}: JobFiltersProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const activeCount = [sector, country, jobType, salaryMin].filter(
    (v) => v && v !== "" && v !== "all" && v !== "0"
  ).length;

  return (
    <motion.div
      className={cn("flex flex-col gap-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("jobs.filters.title")}
        </span>
        {activeCount > 0 && (
          <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
            {activeCount}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {/* Sector */}
        <Select value={sector} onValueChange={(v) => v && onSectorChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("jobs.filters.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("jobs.filters.category")}</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {tc(`sectors.${s.label}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Country */}
        <Select value={country} onValueChange={(v) => v && onCountryChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("jobs.filters.location")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("jobs.filters.location")}</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {tc(`countries.${c.code}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Job Type */}
        <Select value={jobType} onValueChange={(v) => v && onJobTypeChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("jobs.filters.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("jobs.filters.type")}</SelectItem>
            {JOB_TYPES.map((jt) => (
              <SelectItem key={jt.value} value={jt.value}>
                {tc(`jobTypes.${jt.label}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Salary Min */}
        <Select value={salaryMin} onValueChange={(v) => v && onSalaryMinChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("jobs.filters.salary")} />
          </SelectTrigger>
          <SelectContent>
            {SALARY_RANGES.map((sr) => (
              <SelectItem key={sr.value} value={sr.value}>
                {sr.label === "__all__" ? tc("misc.all") : sr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeCount > 0 && (
        <motion.button
          className="self-start text-sm text-brand-600 hover:text-brand-700 hover:underline"
          onClick={onClearFilters}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="inline-flex items-center gap-1">
            <X className="size-3" />
            {tc("actions.clearFilters")}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}
