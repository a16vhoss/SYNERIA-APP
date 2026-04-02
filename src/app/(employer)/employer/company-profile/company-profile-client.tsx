"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { GradientPicker } from "@/components/employer/gradient-picker";
import {
  companyFormSchema,
  type CompanyFormValues,
} from "@/lib/validations/company";
import { COUNTRIES, SECTORS } from "@/lib/constants/countries";

interface CompanyProfileClientProps {
  initialData?: Partial<CompanyFormValues>;
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function CompanyProfileClient({
  initialData,
}: CompanyProfileClientProps) {
  const t = useTranslations("employer");
  const tc = useTranslations("common");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      sector: initialData?.sector ?? "",
      country: initialData?.country ?? "",
      city: initialData?.city ?? "",
      website: initialData?.website ?? "",
      employees_count: initialData?.employees_count ?? undefined,
      logo_gradient: initialData?.logo_gradient ?? "green",
    },
  });

  const companyName = watch("name");
  const description = watch("description");
  const logoGradient = watch("logo_gradient");
  const logoLetter = companyName?.charAt(0) || "E";

  async function onSubmit(data: CompanyFormValues) {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(tc("notAuthenticated"));

      const { error } = await supabase
        .from("companies")
        .update({
          name: data.name,
          description: data.description,
          sector: data.sector,
          country: data.country,
          city: data.city,
          website: data.website,
          logo_letter: data.name?.charAt(0) ?? "E",
          logo_gradient: data.logo_gradient,
        })
        .eq("owner_id", user.id);

      if (error) throw error;
      toast.success(t("companyProfile.success"));
      reset(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"));
    } finally {
      setIsSaving(false);
    }
  }

  function onCancel() {
    reset();
    toast.info(tc("discarded"));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("companyProfile.title")}
        subtitle={t("companyProfile.description")}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Avatar preview section */}
          <motion.div variants={fadeUp}>
            <GlassCard hover={false}>
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <CompanyAvatar
                  letter={logoLetter}
                  gradient={
                    (logoGradient as "green" | "orange" | "purple" | "blue" | "red" | "teal") ||
                    "green"
                  }
                  size="xl"
                />
                <div className="flex flex-1 flex-col gap-3">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {t("companyProfile.companyName")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("companyProfile.logoDescription")}
                    </p>
                  </div>
                  <div>
                    <Label className="mb-2">{t("companyProfile.gradientColor")}</Label>
                    <GradientPicker
                      value={logoGradient ?? "green"}
                      onChange={(g) => setValue("logo_gradient", g, { shouldDirty: true })}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Company name */}
          <motion.div variants={fadeUp}>
            <GlassCard hover={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-brand-600" />
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {t("companyProfile.title")}
                  </h3>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    {t("companyProfile.companyName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder={t("companyProfile.namePlaceholder")}
                    {...register("name")}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">{t("companyProfile.description")}</Label>
                    <span className="text-xs text-muted-foreground">
                      {description?.length ?? 0}/500
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    placeholder={t("companyProfile.descriptionFieldPlaceholder")}
                    rows={4}
                    maxLength={500}
                    {...register("description")}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Sector */}
                <div className="space-y-1.5">
                  <Label htmlFor="sector">{t("companyProfile.industry")}</Label>
                  <select
                    id="sector"
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("sector")}
                  >
                    <option value="">{t("companyProfile.industry")}</option>
                    {SECTORS.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {tc(`sectors.${sector.label}`)}
                      </option>
                    ))}
                  </select>
                  {errors.sector && (
                    <p className="text-xs text-destructive">{errors.sector.message}</p>
                  )}
                </div>

                {/* Country + City */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="country">{t("companyProfile.location")}</Label>
                    <select
                      id="country"
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      {...register("country")}
                    >
                      <option value="">{t("companyProfile.location")}</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-xs text-destructive">{errors.country.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">{t("vacancies.create.location")}</Label>
                    <Input
                      id="city"
                      placeholder={t("companyProfile.cityPlaceholder")}
                      {...register("city")}
                      aria-invalid={!!errors.city}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <Label htmlFor="website">{t("companyProfile.website")}</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder={t("companyProfile.websitePlaceholder")}
                    {...register("website")}
                    aria-invalid={!!errors.website}
                  />
                  {errors.website && (
                    <p className="text-xs text-destructive">{errors.website.message}</p>
                  )}
                </div>

                {/* Number of employees */}
                <div className="space-y-1.5">
                  <Label htmlFor="employees_count">{t("companyProfile.size")}</Label>
                  <Input
                    id="employees_count"
                    type="number"
                    min={0}
                    placeholder={t("companyProfile.employeesPlaceholder")}
                    {...register("employees_count", { valueAsNumber: true })}
                    aria-invalid={!!errors.employees_count}
                  />
                  {errors.employees_count && (
                    <p className="text-xs text-destructive">
                      {errors.employees_count.message}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-end gap-3"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={!isDirty || isSaving}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving ? t("companyProfile.saving") : t("companyProfile.save")}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
