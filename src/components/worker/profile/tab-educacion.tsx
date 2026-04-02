"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";
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
import { useTranslations } from "next-intl";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

function createEducationSchema(tc: ReturnType<typeof useTranslations>) {
  return z.object({
    institution: z.string().min(2, tc("validation.required")),
    degree: z.string().min(2, tc("validation.required")),
    startDate: z.string().min(1, tc("validation.required")),
    endDate: z.string().optional().default(""),
    description: z.string().max(500).optional().default(""),
  });
}

type EducationFormValues = z.infer<ReturnType<typeof createEducationSchema>>;

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

export function TabEducacion() {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const educationSchema = createEducationSchema(tc);
  const [entries, setEntries] = useState<EducationEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema) as any,
    defaultValues: {
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  function openAdd() {
    setEditingId(null);
    reset({
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setDialogOpen(true);
  }

  function openEdit(entry: EducationEntry) {
    setEditingId(entry.id);
    reset({
      institution: entry.institution,
      degree: entry.degree,
      startDate: entry.startDate,
      endDate: entry.endDate ?? "",
      description: entry.description,
    });
    setDialogOpen(true);
  }

  function onDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function onSubmit(data: EducationFormValues) {
    if (editingId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, ...data, endDate: data.endDate || null }
            : e
        )
      );
    } else {
      const newEntry: EducationEntry = {
        id: `edu_${Date.now()}`,
        ...data,
        endDate: data.endDate || null,
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
          icon={GraduationCap}
          title={t("profile.education.noEducation")}
          description={t("profile.education.emptyDescription")}
          action={{ label: t("profile.education.addEducation"), onClick: openAdd }}
        />

        <EducationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingId={editingId}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          labels={{
            addTitle: t("profile.education.addEducation"),
            editTitle: t("profile.education.editEducation"),
            institution: t("profile.education.institution"),
            degree: t("profile.education.degree"),
            field: t("profile.education.field"),
            startDate: t("profile.education.startDate"),
            endDate: t("profile.education.endDate"),
            description: t("profile.experience.description"),
            cancel: tc("actions.cancel"),
            save: tc("actions.save"),
            add: tc("actions.create"),
            institutionPlaceholder: t("profile.education.institutionPlaceholder"),
            degreePlaceholder: t("profile.education.degreePlaceholder"),
            descriptionPlaceholder: t("profile.education.descriptionPlaceholder"),
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {t("profile.tabs.education")}
        </h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          {t("profile.education.addEducation")}
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
                      {entry.degree}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {entry.institution}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.startDate} - {entry.endDate ?? t("profile.education.current")}
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
      <EducationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        labels={{
          addTitle: t("profile.education.addEducation"),
          editTitle: t("profile.education.editEducation"),
          institution: t("profile.education.institution"),
          degree: t("profile.education.degree"),
          field: t("profile.education.field"),
          startDate: t("profile.education.startDate"),
          endDate: t("profile.education.endDate"),
          description: t("profile.experience.description"),
          cancel: tc("actions.cancel"),
          save: tc("actions.save"),
          add: tc("actions.create"),
          institutionPlaceholder: t("profile.education.institutionPlaceholder"),
          degreePlaceholder: t("profile.education.degreePlaceholder"),
          descriptionPlaceholder: t("profile.education.descriptionPlaceholder"),
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog                                                             */
/* ------------------------------------------------------------------ */

interface EducationDialogLabels {
  addTitle: string;
  editTitle: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  cancel: string;
  save: string;
  add: string;
  institutionPlaceholder: string;
  degreePlaceholder: string;
  descriptionPlaceholder: string;
}

interface EducationDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  register: ReturnType<typeof useForm<EducationFormValues>>["register"];
  errors: ReturnType<typeof useForm<EducationFormValues>>["formState"]["errors"];
  onSubmit: () => void;
  labels: EducationDialogLabels;
}

function EducationDialog({
  open,
  onOpenChange,
  editingId,
  register,
  errors,
  onSubmit,
  labels,
}: EducationDialogProps) {
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
              <Label htmlFor="edu-institution">{labels.institution}</Label>
              <Input
                id="edu-institution"
                placeholder={labels.institutionPlaceholder}
                {...register("institution")}
                aria-invalid={!!errors.institution}
              />
              {errors.institution && (
                <p className="text-xs text-destructive">{errors.institution.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edu-degree">{labels.degree}</Label>
              <Input
                id="edu-degree"
                placeholder={labels.degreePlaceholder}
                {...register("degree")}
                aria-invalid={!!errors.degree}
              />
              {errors.degree && (
                <p className="text-xs text-destructive">{errors.degree.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edu-start">{labels.startDate}</Label>
                <Input
                  id="edu-start"
                  type="date"
                  {...register("startDate")}
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edu-end">{labels.endDate}</Label>
                <Input
                  id="edu-end"
                  type="date"
                  {...register("endDate")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edu-desc">{labels.description}</Label>
              <Textarea
                id="edu-desc"
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
