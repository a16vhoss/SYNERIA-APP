"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

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

// ── Schema ────────────────────────────────────
const vacancySchema = z.object({
  title: z.string().min(3, "Minimo 3 caracteres"),
  description: z.string().min(10, "Minimo 10 caracteres"),
  sector: z.string().min(1, "Selecciona un sector"),
  contract_type: z.string().min(1, "Selecciona un tipo"),
  country: z.string().min(1, "Selecciona un pais"),
  city: z.string().min(2, "Minimo 2 caracteres"),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
});

type VacancyFormData = z.infer<typeof vacancySchema>;

interface CreateVacancyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: VacancyFormData) => void;
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.04, type: "spring" as const, stiffness: 300, damping: 25 },
  }),
};

export function CreateVacancyModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateVacancyModalProps) {
  const t = useTranslations("employer");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VacancyFormData>({
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

  function onFormSubmit(data: VacancyFormData) {
    onSubmit?.(data);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold">
            {t("vacancies.create.title")}
          </DialogTitle>
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
              <Label htmlFor="title">{t("vacancies.create.jobTitle")}</Label>
              <Input
                id="title"
                placeholder={t("vacancies.create.jobTitlePlaceholder")}
                {...register("title", { required: "Campo requerido", minLength: { value: 3, message: "Minimo 3 caracteres" } })}
                aria-invalid={!!errors.title}
                className="mt-1"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
              )}
            </motion.div>

            <motion.div variants={fieldVariants} custom={2}>
              <Label htmlFor="description">{t("vacancies.create.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("vacancies.create.descriptionPlaceholder")}
                rows={3}
                {...register("description", { required: "Campo requerido", minLength: { value: 10, message: "Minimo 10 caracteres" } })}
                aria-invalid={!!errors.description}
                className="mt-1"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
              )}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={fieldVariants}
              custom={3}
            >
              <div>
                <Label htmlFor="sector">{t("vacancies.create.category")}</Label>
                <select
                  id="sector"
                  {...register("sector", { required: "Selecciona un sector" })}
                  className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Seleccionar sector</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="mt-1 text-xs text-destructive">{errors.sector.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contract_type">{t("vacancies.create.type")}</Label>
                <select
                  id="contract_type"
                  {...register("contract_type", { required: "Selecciona un tipo" })}
                  className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Jornada Completa</option>
                  {JOB_TYPES.map((j) => (
                    <option key={j.value} value={j.value}>
                      {j.label}
                    </option>
                  ))}
                </select>
                {errors.contract_type && (
                  <p className="mt-1 text-xs text-destructive">{errors.contract_type.message}</p>
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
                <Label htmlFor="country">{t("companyProfile.location")}</Label>
                <select
                  id="country"
                  {...register("country", { required: "Selecciona un pais" })}
                  className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Seleccionar pais</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Ciudad"
                  {...register("city", { required: "Campo requerido", minLength: { value: 2, message: "Minimo 2 caracteres" } })}
                  aria-invalid={!!errors.city}
                  className="mt-1"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={fieldVariants}
              custom={6}
            >
              <div>
                <Label htmlFor="salary_min">{t("vacancies.create.salaryMin")}</Label>
                <Input
                  id="salary_min"
                  type="number"
                  placeholder="Salario minimo"
                  {...register("salary_min")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="salary_max">{t("vacancies.create.salaryMax")}</Label>
                <Input
                  id="salary_max"
                  type="number"
                  placeholder="Salario maximo"
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
              <Label htmlFor="requirements">{t("vacancies.create.requirements")}</Label>
              <Textarea
                id="requirements"
                placeholder={t("vacancies.create.requirementsPlaceholder")}
                rows={3}
                {...register("requirements")}
                className="mt-1"
              />
            </motion.div>

            <motion.div variants={fieldVariants} custom={9}>
              <Label htmlFor="benefits">{t("vacancies.create.benefits")}</Label>
              <Textarea
                id="benefits"
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
              {isSubmitting ? t("vacancies.create.publishing") : t("vacancies.create.publish")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
