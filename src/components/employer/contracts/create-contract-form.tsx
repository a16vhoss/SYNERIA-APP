"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Eye,
} from "lucide-react";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { createContract } from "@/lib/actions/contracts";
import type { ContractData } from "@/lib/actions/contracts";

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const contractSchema = z.object({
  worker_name: z.string().min(1, "Selecciona un trabajador"),
  position: z.string().min(3, "Minimo 3 caracteres"),
  work_schedule: z.string().min(3, "Ingresa un horario"),
  country: z.string().min(1, "Ingresa el pais"),
  city: z.string().min(2, "Ingresa la ciudad"),
  salary: z.string().min(1, "Ingresa el salario"),
  currency: z.string().min(1, "Selecciona moneda"),
  start_date: z.string().min(1, "Ingresa fecha de inicio"),
  end_date: z.string().min(1, "Ingresa fecha de fin"),
  terms: z.string().min(10, "Minimo 10 caracteres"),
  visa_sponsorship: z.boolean().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

/* ------------------------------------------------------------------ */
/*  Benefits                                                           */
/* ------------------------------------------------------------------ */

const AVAILABLE_BENEFITS = [
  "Alojamiento",
  "Seguro Medico",
  "Transporte",
  "Comida",
  "Formacion",
  "Herramientas",
  "Laptop",
  "Vacaciones Extras",
];

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const sectionVariants = {
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CreateContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (contract: ContractData) => void;
  acceptedCandidates?: { id: string; name: string; role_applied: string }[];
}

export function CreateContractForm({
  open,
  onOpenChange,
  onCreated,
  acceptedCandidates = [],
}: CreateContractFormProps) {
  const t = useTranslations("employer");
  const tc = useTranslations("common");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "preview">("form");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      worker_name: "",
      position: "",
      work_schedule: "Lunes a Viernes, 9:00 - 18:00",
      country: "",
      city: "",
      salary: "",
      currency: "USD",
      start_date: "",
      end_date: "",
      terms: "",
      visa_sponsorship: false,
    },
  });

  const formValues = watch();

  function toggleBenefit(benefit: string) {
    setSelectedBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit]
    );
  }

  async function onFormSubmit(data: ContractFormData) {
    const result = await createContract({
      worker_id: "usr_002",
      worker_name: data.worker_name,
      employer_id: "",
      company_name: "Tech Employer Test",
      company_letter: "T",
      company_gradient: "green",
      position: data.position,
      country: data.country,
      city: data.city,
      salary: Number(data.salary),
      currency: data.currency,
      start_date: data.start_date,
      end_date: data.end_date,
      terms: data.terms,
      benefits: selectedBenefits,
      visa_sponsorship: data.visa_sponsorship ?? false,
      work_schedule: data.work_schedule,
      signature_employer: "signed",
    });

    onCreated(result);
    reset();
    setSelectedBenefits([]);
    setStep("form");
  }

  function handleClose(v: boolean) {
    if (!v) {
      reset();
      setSelectedBenefits([]);
      setStep("form");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
            <FileText className="size-5 text-brand-600" />
            {step === "form" ? t("contracts.create.title") : t("contracts.create.preview")}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <form
            onSubmit={handleSubmit(() => setStep("preview"))}
            className="space-y-6"
          >
            {/* Section 1: Worker + Position */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
            >
              <motion.p
                custom={0}
                variants={sectionVariants}
                className="flex items-center gap-2 text-sm font-semibold text-brand-700"
              >
                <Briefcase className="size-4" />
                {t("contracts.create.positionInfo")}
              </motion.p>

              <motion.div custom={1} variants={sectionVariants}>
                <Label htmlFor="worker_name">{t("contracts.create.worker")}</Label>
                <select
                  id="worker_name"
                  {...register("worker_name")}
                  className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">{t("contracts.create.selectCandidate")}</option>
                  {acceptedCandidates.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} - {c.role_applied}
                    </option>
                  ))}
                  <option value="Otro trabajador">{t("contracts.create.otherWorker")}</option>
                </select>
                {errors.worker_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.worker_name.message}
                  </p>
                )}
              </motion.div>

              <motion.div custom={2} variants={sectionVariants}>
                <Label htmlFor="position">{t("contracts.create.position")}</Label>
                <Input
                  id="position"
                  placeholder="Ej: Asistente de Construccion"
                  {...register("position")}
                  className="mt-1"
                />
                {errors.position && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.position.message}
                  </p>
                )}
              </motion.div>

              <motion.div custom={3} variants={sectionVariants}>
                <Label htmlFor="work_schedule">{t("contracts.create.schedule")}</Label>
                <Input
                  id="work_schedule"
                  placeholder="Ej: Lunes a Viernes, 9:00 - 18:00"
                  {...register("work_schedule")}
                  className="mt-1"
                />
                {errors.work_schedule && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.work_schedule.message}
                  </p>
                )}
              </motion.div>
            </motion.div>

            {/* Section 2: Location + Salary */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
            >
              <motion.p
                custom={4}
                variants={sectionVariants}
                className="flex items-center gap-2 text-sm font-semibold text-brand-700"
              >
                <MapPin className="size-4" />
                {t("contracts.create.locationAndSalary")}
              </motion.p>

              <motion.div
                custom={5}
                variants={sectionVariants}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <Label htmlFor="country">{t("companyProfile.location")}</Label>
                  <Input
                    id="country"
                    placeholder="Chile"
                    {...register("country")}
                    className="mt-1"
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">{t("vacancies.create.location")}</Label>
                  <Input
                    id="city"
                    placeholder="Santiago"
                    {...register("city")}
                    className="mt-1"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                custom={6}
                variants={sectionVariants}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <Label htmlFor="salary">{t("contracts.create.salary")}</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="salary"
                      type="number"
                      placeholder="3000"
                      {...register("salary")}
                      className="pl-8"
                    />
                  </div>
                  {errors.salary && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.salary.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currency">{t("contracts.create.currency")}</Label>
                  <select
                    id="currency"
                    {...register("currency")}
                    className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="CHF">CHF</option>
                    <option value="GBP">GBP</option>
                    <option value="NOK">NOK</option>
                    <option value="SEK">SEK</option>
                    <option value="CLP">CLP</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
              </motion.div>
            </motion.div>

            {/* Section 3: Dates */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
            >
              <motion.p
                custom={7}
                variants={sectionVariants}
                className="flex items-center gap-2 text-sm font-semibold text-brand-700"
              >
                <Calendar className="size-4" />
                {t("contracts.create.dates")}
              </motion.p>

              <motion.div
                custom={8}
                variants={sectionVariants}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <Label htmlFor="start_date">{t("contracts.create.startDate")}</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                    className="mt-1"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end_date">{t("contracts.create.endDate")}</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...register("end_date")}
                    className="mt-1"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Section 4: Terms + Benefits */}
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
            >
              <motion.p
                custom={9}
                variants={sectionVariants}
                className="flex items-center gap-2 text-sm font-semibold text-brand-700"
              >
                <FileText className="size-4" />
                {t("contracts.create.termsAndBenefits")}
              </motion.p>

              <motion.div custom={10} variants={sectionVariants}>
                <Label htmlFor="terms">{t("contracts.create.terms")}</Label>
                <Textarea
                  id="terms"
                  placeholder="Describe los terminos y condiciones del contrato..."
                  {...register("terms")}
                  className="mt-1 min-h-24"
                />
                {errors.terms && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.terms.message}
                  </p>
                )}
              </motion.div>

              <motion.div custom={11} variants={sectionVariants}>
                <Label className="mb-2 block">{t("vacancies.create.benefits")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_BENEFITS.map((benefit) => (
                    <label
                      key={benefit}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-foreground/5 p-2 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedBenefits.includes(benefit)}
                        onCheckedChange={() => toggleBenefit(benefit)}
                      />
                      <span className="text-sm">{benefit}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              <motion.div custom={12} variants={sectionVariants}>
                <div className="flex items-center justify-between rounded-lg border border-foreground/5 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("contracts.create.visaSponsorship")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("contracts.create.visaSponsorshipDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={formValues.visa_sponsorship ?? false}
                    onCheckedChange={(v) => setValue("visa_sponsorship", v === true)}
                  />
                </div>
              </motion.div>
            </motion.div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                {tc("cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-brand-600 text-white hover:bg-brand-700"
              >
                <Eye className="size-4" data-icon="inline-start" />
                {t("contracts.create.preview")}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Preview step */
          <div className="space-y-4">
            <div className="rounded-lg border border-foreground/10 bg-muted/30 p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("contracts.create.worker")}
                </p>
                <p className="font-semibold text-foreground">
                  {formValues.worker_name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("contracts.create.position")}
                </p>
                <p className="text-foreground">{formValues.position}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("companyProfile.location")}
                  </p>
                  <p className="text-foreground">
                    {formValues.city}, {formValues.country}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("contracts.create.salary")}
                  </p>
                  <p className="text-foreground">
                    {formValues.currency} ${formValues.salary}/mes
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("contracts.create.startDate")}
                  </p>
                  <p className="text-foreground">{formValues.start_date}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("contracts.create.endDate")}
                  </p>
                  <p className="text-foreground">{formValues.end_date}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("contracts.create.schedule")}
                </p>
                <p className="text-foreground">{formValues.work_schedule}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("contracts.create.terms")}
                </p>
                <p className="text-sm text-foreground">{formValues.terms}</p>
              </div>
              {selectedBenefits.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("vacancies.create.benefits")}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedBenefits.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {formValues.visa_sponsorship && (
                <p className="text-xs font-medium text-emerald-600">
                  {t("contracts.create.visaSponsorshipIncluded")}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep("form")}
              >
                {t("vacancies.edit.title")}
              </Button>
              <Button
                onClick={handleSubmit(onFormSubmit)}
                disabled={isSubmitting}
                className="bg-brand-600 text-white hover:bg-brand-700"
              >
                {isSubmitting ? t("contracts.create.sending") : t("contracts.create.send")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
