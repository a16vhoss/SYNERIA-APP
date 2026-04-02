"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { COUNTRIES, SECTORS, JOB_TYPES } from "@/lib/constants/countries";
import type { MockVacancy } from "@/lib/constants/mock-data";

// ── Form data ────────────────────────────────────────────────────────
export interface EditVacancyFormData {
  title: string;
  description: string;
  sector: string;
  contract_type: string;
  country: string;
  city: string;
  salary_min: string;
  salary_max: string;
  requirements: string;
  benefits: string;
}

interface EditVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: MockVacancy | null;
  onSubmit?: (id: string, data: EditVacancyFormData) => void;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 + i * 0.04,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
};

const selectClasses =
  "mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function EditVacancyModal({
  open,
  onOpenChange,
  vacancy,
  onSubmit,
}: EditVacancyModalProps) {
  const t = useTranslations("employer");
  const tc = useTranslations("common");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditVacancyFormData>({
    defaultValues: {
      title: "",
      description: "",
      sector: "",
      contract_type: "",
      country: "",
      city: "",
      salary_min: "",
      salary_max: "",
      requirements: "",
      benefits: "",
    },
  });

  // Reset form with vacancy data whenever vacancy changes
  useEffect(() => {
    if (vacancy) {
      reset({
        title: vacancy.title,
        description: vacancy.description,
        sector: vacancy.sector,
        contract_type: vacancy.contract_type,
        country: vacancy.country,
        city: vacancy.city,
        salary_min: vacancy.salary_min?.toString() ?? "",
        salary_max: vacancy.salary_max?.toString() ?? "",
        requirements: "",
        benefits: "",
      });
    }
  }, [vacancy, reset]);

  function onFormSubmit(data: EditVacancyFormData) {
    if (!vacancy) return;
    onSubmit?.(vacancy.id, data);
    onOpenChange(false);
  }

  function formatPublishedDate(dateStr: string) {
    try {
      return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es });
    } catch {
      return dateStr;
    }
  }

  if (!vacancy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">
            {t("vacancies.edit.title")}
          </DialogTitle>
          {vacancy.published_at && (
            <motion.div
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Clock className="size-3" />
              {t("dashboard.vacanciesTable.posted")}: {formatPublishedDate(vacancy.published_at)}
            </motion.div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* ── INFORMACION DEL PUESTO ── */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              variants={fieldVariants}
              custom={0}
            >
              {t("vacancies.create.jobTitle")}
            </motion.p>

            <motion.div variants={fieldVariants} custom={1}>
              <Label htmlFor="edit-title">{t("vacancies.create.jobTitle")}</Label>
              <Input
                id="edit-title"
                placeholder={t("vacancies.create.jobTitlePlaceholder")}
                {...register("title", {
                  required: t("vacancies.create.errors.fieldRequired"),
                  minLength: { value: 3, message: t("vacancies.create.errors.minChars3") },
                })}
                aria-invalid={!!errors.title}
                className="mt-1"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={fieldVariants} custom={2}>
              <Label htmlFor="edit-description">{t("vacancies.create.description")}</Label>
              <Textarea
                id="edit-description"
                placeholder={t("vacancies.create.descriptionPlaceholder")}
                rows={3}
                {...register("description", {
                  required: t("vacancies.create.errors.fieldRequired"),
                  minLength: { value: 10, message: t("vacancies.create.errors.minChars10") },
                })}
                aria-invalid={!!errors.description}
                className="mt-1"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={fieldVariants}
              custom={3}
            >
              <div>
                <Label htmlFor="edit-sector">{t("vacancies.create.category")}</Label>
                <select
                  id="edit-sector"
                  {...register("sector", {
                    required: t("vacancies.create.errors.selectSector"),
                  })}
                  className={selectClasses}
                >
                  <option value="">{t("vacancies.create.selectSectorPlaceholder")}</option>
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {tc(`sectors.${s.label}`)}
                    </option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.sector.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-contract_type">{t("vacancies.create.type")}</Label>
                <select
                  id="edit-contract_type"
                  {...register("contract_type", {
                    required: t("vacancies.create.errors.selectType"),
                  })}
                  className={selectClasses}
                >
                  <option value="">{t("vacancies.create.fullTime")}</option>
                  {JOB_TYPES.map((j) => (
                    <option key={j.value} value={j.value}>
                      {tc(`jobTypes.${j.label}`)}
                    </option>
                  ))}
                </select>
                {errors.contract_type && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.contract_type.message}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* ── UBICACION Y SALARIO ── */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              variants={fieldVariants}
              custom={4}
            >
              {t("vacancies.create.location")}
            </motion.p>

            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={fieldVariants}
              custom={5}
            >
              <div>
                <Label htmlFor="edit-country">{t("companyProfile.location")}</Label>
                <select
                  id="edit-country"
                  {...register("country", {
                    required: t("vacancies.create.errors.selectCountry"),
                  })}
                  className={selectClasses}
                >
                  <option value="">{t("vacancies.create.selectCountryPlaceholder")}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-city">{t("vacancies.create.cityLabel")}</Label>
                <Input
                  id="edit-city"
                  placeholder={t("vacancies.create.cityPlaceholder")}
                  {...register("city", {
                    required: t("vacancies.create.errors.fieldRequired"),
                    minLength: { value: 2, message: t("vacancies.create.errors.minChars2") },
                  })}
                  aria-invalid={!!errors.city}
                  className="mt-1"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={fieldVariants}
              custom={6}
            >
              <div>
                <Label htmlFor="edit-salary_min">{t("vacancies.create.salaryMin")}</Label>
                <Input
                  id="edit-salary_min"
                  type="number"
                  placeholder={t("vacancies.create.salaryMinPlaceholder")}
                  {...register("salary_min")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-salary_max">{t("vacancies.create.salaryMax")}</Label>
                <Input
                  id="edit-salary_max"
                  type="number"
                  placeholder={t("vacancies.create.salaryMaxPlaceholder")}
                  {...register("salary_max")}
                  className="mt-1"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* ── REQUISITOS Y BENEFICIOS ── */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              variants={fieldVariants}
              custom={7}
            >
              {t("vacancies.create.requirements")}
            </motion.p>

            <motion.div variants={fieldVariants} custom={8}>
              <Label htmlFor="edit-requirements">{t("vacancies.create.requirements")}</Label>
              <Textarea
                id="edit-requirements"
                placeholder={t("vacancies.create.requirementsPlaceholder")}
                rows={3}
                {...register("requirements")}
                className="mt-1"
              />
            </motion.div>

            <motion.div variants={fieldVariants} custom={9}>
              <Label htmlFor="edit-benefits">{t("vacancies.create.benefits")}</Label>
              <Textarea
                id="edit-benefits"
                placeholder={t("vacancies.create.benefitsPlaceholder")}
                rows={3}
                {...register("benefits")}
                className="mt-1"
              />
            </motion.div>
          </motion.div>

          {/* ── Footer ── */}
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" type="button" />}
            >
              {t("candidates.interview.cancel")}
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 text-white hover:bg-brand-700"
            >
              {isSubmitting ? t("vacancies.edit.saving") : t("vacancies.edit.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
