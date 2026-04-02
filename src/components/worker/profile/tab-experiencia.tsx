"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

function createExperienceSchema(tc: ReturnType<typeof useTranslations>) {
  return z.object({
    title: z.string().min(2, tc("validation.required")),
    company: z.string().min(2, tc("validation.required")),
    startDate: z.string().min(1, tc("validation.required")),
    endDate: z.string().optional().default(""),
    current: z.boolean().default(false),
    description: z.string().max(500).optional().default(""),
  });
}

type ExperienceFormValues = z.infer<ReturnType<typeof createExperienceSchema>>;

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
};

const modalVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 40 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TabExperiencia() {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const experienceSchema = createExperienceSchema(tc);
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema) as any,
    defaultValues: {
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  });

  const isCurrent = watch("current");

  function openAdd() {
    setEditingId(null);
    reset({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setDialogOpen(true);
  }

  function openEdit(entry: ExperienceEntry) {
    setEditingId(entry.id);
    reset({
      title: entry.title,
      company: entry.company,
      startDate: entry.startDate,
      endDate: entry.endDate ?? "",
      current: entry.current,
      description: entry.description,
    });
    setDialogOpen(true);
  }

  function onDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function onSubmit(data: ExperienceFormValues) {
    if (editingId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? {
                ...e,
                ...data,
                endDate: data.current ? null : (data.endDate || null),
              }
            : e
        )
      );
    } else {
      const newEntry: ExperienceEntry = {
        id: `exp_${Date.now()}`,
        ...data,
        endDate: data.current ? null : (data.endDate || null),
      };
      setEntries((prev) => [...prev, newEntry]);
    }
    setDialogOpen(false);
  }

  /* Empty state */
  if (entries.length === 0 && !dialogOpen) {
    return (
      <>
        <EmptyState
          icon={Briefcase}
          title={t("profile.experience.noExperience")}
          description={t("profile.experience.emptyDescription")}
          action={{ label: t("profile.experience.addExperience"), onClick: openAdd }}
        />

        <ExperienceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingId={editingId}
          register={register}
          errors={errors}
          isCurrent={isCurrent}
          setValue={setValue}
          onSubmit={handleSubmit(onSubmit)}
          labels={{
            addTitle: t("profile.experience.addExperience"),
            editTitle: t("profile.experience.editExperience"),
            position: t("profile.experience.position"),
            company: t("profile.experience.company"),
            startDate: t("profile.experience.startDate"),
            endDate: t("profile.experience.endDate"),
            current: t("profile.experience.current"),
            description: t("profile.experience.description"),
            cancel: tc("actions.cancel"),
            save: tc("actions.save"),
            add: tc("actions.create"),
            positionPlaceholder: t("profile.experience.positionPlaceholder"),
            companyPlaceholder: t("profile.experience.companyPlaceholder"),
            descriptionPlaceholder: t("profile.experience.descriptionPlaceholder"),
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Header with add button */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {t("profile.tabs.experience")}
        </h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          {t("profile.experience.addExperience")}
        </Button>
      </div>

      {/* Cards */}
      <motion.div
        className="space-y-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              variants={cardVariant}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
              layout
            >
              <GlassCard hover={false} className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-heading text-sm font-semibold text-foreground">
                      {entry.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{entry.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.startDate} - {entry.current ? t("profile.experience.current") : entry.endDate}
                    </p>
                    {entry.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(entry)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <ExperienceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        register={register}
        errors={errors}
        isCurrent={isCurrent}
        setValue={setValue}
        onSubmit={handleSubmit(onSubmit)}
        labels={{
          addTitle: t("profile.experience.addExperience"),
          editTitle: t("profile.experience.editExperience"),
          position: t("profile.experience.position"),
          company: t("profile.experience.company"),
          startDate: t("profile.experience.startDate"),
          endDate: t("profile.experience.endDate"),
          current: t("profile.experience.current"),
          description: t("profile.experience.description"),
          cancel: tc("actions.cancel"),
          save: tc("actions.save"),
          add: tc("actions.create"),
          positionPlaceholder: t("profile.experience.positionPlaceholder"),
          companyPlaceholder: t("profile.experience.companyPlaceholder"),
          descriptionPlaceholder: t("profile.experience.descriptionPlaceholder"),
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog                                                             */
/* ------------------------------------------------------------------ */

interface ExperienceDialogLabels {
  addTitle: string;
  editTitle: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: string;
  description: string;
  cancel: string;
  save: string;
  add: string;
  positionPlaceholder: string;
  companyPlaceholder: string;
  descriptionPlaceholder: string;
}

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  register: ReturnType<typeof useForm<ExperienceFormValues>>["register"];
  errors: ReturnType<typeof useForm<ExperienceFormValues>>["formState"]["errors"];
  isCurrent: boolean;
  setValue: ReturnType<typeof useForm<ExperienceFormValues>>["setValue"];
  onSubmit: () => void;
  labels: ExperienceDialogLabels;
}

function ExperienceDialog({
  open,
  onOpenChange,
  editingId,
  register,
  errors,
  isCurrent,
  setValue,
  onSubmit,
  labels,
}: ExperienceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div variants={modalVariant} initial="hidden" animate="visible" exit="exit">
          <DialogHeader>
            <DialogTitle>
              {editingId ? labels.editTitle : labels.addTitle}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="exp-title">{labels.position}</Label>
              <Input
                id="exp-title"
                placeholder={labels.positionPlaceholder}
                {...register("title")}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-company">{labels.company}</Label>
              <Input
                id="exp-company"
                placeholder={labels.companyPlaceholder}
                {...register("company")}
                aria-invalid={!!errors.company}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-start">{labels.startDate}</Label>
                <Input
                  id="exp-start"
                  type="date"
                  {...register("startDate")}
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-end">{labels.endDate}</Label>
                <Input
                  id="exp-end"
                  type="date"
                  disabled={isCurrent}
                  {...register("endDate")}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isCurrent}
                onCheckedChange={(val: boolean) =>
                  setValue("current", val, { shouldValidate: true })
                }
              />
              <Label className="cursor-pointer text-sm font-normal">
                {labels.current}
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-desc">{labels.description}</Label>
              <Textarea
                id="exp-desc"
                rows={3}
                maxLength={500}
                placeholder={labels.descriptionPlaceholder}
                {...register("description")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {labels.cancel}
              </Button>
              <Button type="submit">
                {editingId ? labels.save : labels.add}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
