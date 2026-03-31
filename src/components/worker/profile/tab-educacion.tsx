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

const educationSchema = z.object({
  institution: z.string().min(2, "Institucion requerida"),
  degree: z.string().min(2, "Titulo / grado requerido"),
  startDate: z.string().min(1, "Fecha inicio requerida"),
  endDate: z.string().optional().default(""),
  description: z.string().max(500).optional().default(""),
});

type EducationFormValues = z.infer<typeof educationSchema>;

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
          title="No has agregado educacion aun"
          description="Agrega tu formacion academica para fortalecer tu perfil profesional."
          action={{ label: "Agregar Educacion", onClick: openAdd }}
        />

        <EducationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingId={editingId}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
        />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Educacion
        </h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          Agregar
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
                      {entry.startDate} - {entry.endDate ?? "Actualmente"}
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
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog                                                             */
/* ------------------------------------------------------------------ */

interface EducationDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingId: string | null;
  register: ReturnType<typeof useForm<EducationFormValues>>["register"];
  errors: ReturnType<typeof useForm<EducationFormValues>>["formState"]["errors"];
  onSubmit: () => void;
}

function EducationDialog({
  open,
  onOpenChange,
  editingId,
  register,
  errors,
  onSubmit,
}: EducationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div variants={modalVariant} initial="hidden" animate="visible" exit="exit">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Educacion" : "Agregar Educacion"}
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
              <Label htmlFor="edu-institution">Institucion</Label>
              <Input
                id="edu-institution"
                placeholder="Ej: Universidad Nacional"
                {...register("institution")}
                aria-invalid={!!errors.institution}
              />
              {errors.institution && (
                <p className="text-xs text-destructive">{errors.institution.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edu-degree">Titulo / Grado</Label>
              <Input
                id="edu-degree"
                placeholder="Ej: Ingenieria Civil"
                {...register("degree")}
                aria-invalid={!!errors.degree}
              />
              {errors.degree && (
                <p className="text-xs text-destructive">{errors.degree.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edu-start">Fecha inicio</Label>
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
                <Label htmlFor="edu-end">Fecha fin</Label>
                <Input
                  id="edu-end"
                  type="date"
                  {...register("endDate")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edu-desc">Descripcion</Label>
              <Textarea
                id="edu-desc"
                rows={3}
                maxLength={500}
                placeholder="Describe tu formacion..."
                {...register("description")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? "Guardar Cambios" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
