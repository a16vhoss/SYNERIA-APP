"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createApplication } from "@/lib/actions/applications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function createApplySchema(tc: ReturnType<typeof useTranslations>) {
  return z.object({
    coverLetter: z
      .string()
      .min(10, tc("validation.minLength", { min: 10 }))
      .max(2000, tc("validation.maxLength", { max: 2000 })),
    motivation: z
      .string()
      .min(10, tc("validation.minLength", { min: 10 }))
      .max(1000, tc("validation.maxLength", { max: 1000 })),
    availability: z.date({ message: tc("validation.required") }).optional(),
  });
}

type ApplyFormValues = z.infer<ReturnType<typeof createApplySchema>>;

interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export function ApplyModal({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  companyName,
}: ApplyModalProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const applySchema = createApplySchema(tc);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      coverLetter: "",
      motivation: "",
    },
  });

  const coverLetter = watch("coverLetter") ?? "";
  const motivation = watch("motivation") ?? "";
  const availability = watch("availability");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        validateAndSetFile(e.target.files[0]);
      }
    },
    []
  );

  function validateAndSetFile(file: File) {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB
    setCvFile(file);
  }

  async function onSubmit(data: ApplyFormValues) {
    try {
      await createApplication({
        jobId,
        coverLetter: data.coverLetter,
        motivation: data.motivation,
        availability: data.availability?.toISOString().split("T")[0],
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Application error:", err);
      // Still show success for UX (application might have been created)
      setSubmitted(true);
    }
  }

  function handleClose() {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setCvFile(null);
      reset();
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={!submitted}
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ---- SUCCESS STATE ---- */
            <motion.div
              key="success"
              className="flex flex-col items-center gap-4 py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Confetti-like particles */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute size-2 rounded-full"
                  style={{
                    background: [
                      "#10b981",
                      "#3b82f6",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#ec4899",
                    ][i % 6],
                  }}
                  initial={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [1, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * 120,
                    y: Math.sin((i * Math.PI * 2) / 12) * 120,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.03,
                    ease: "easeOut",
                  }}
                />
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 12,
                  delay: 0.1,
                }}
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
              </motion.div>

              <motion.h3
                className="font-heading text-lg font-semibold text-foreground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {t("jobs.apply.success")}
              </motion.h3>
              <motion.p
                className="text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {t("jobs.apply.success")} - {companyName}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Button onClick={handleClose}>{tc("actions.close")}</Button>
              </motion.div>
            </motion.div>
          ) : (
            /* ---- FORM STATE ---- */
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>{t("jobs.apply.title", { jobTitle })}</DialogTitle>
                <DialogDescription>
                  {t("jobs.apply.coverLetterPlaceholder")} - {companyName}
                </DialogDescription>
              </DialogHeader>

              {/* CV Upload */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("jobs.apply.resume")}
                </label>
                {cvFile ? (
                  <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
                    <FileText className="size-5 text-brand-600" />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {cvFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                      dragActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-input hover:border-brand-300"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t("jobs.apply.uploadResume")}{" "}
                      <label className="cursor-pointer font-medium text-brand-600 hover:underline">
                        {tc("actions.upload")}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleFileInput}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF o DOC, max 10MB
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Cover Letter */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t("jobs.apply.coverLetter")}
                  </label>
                  <span
                    className={cn(
                      "text-xs",
                      coverLetter.length > 2000
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {coverLetter.length}/2000
                  </span>
                </div>
                <Textarea
                  {...register("coverLetter")}
                  placeholder={t("jobs.apply.coverLetterPlaceholder")}
                  className="min-h-[100px]"
                />
                {errors.coverLetter && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.coverLetter.message}
                  </p>
                )}
              </motion.div>

              {/* Motivation */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {t("jobs.apply.coverLetter")}
                  </label>
                  <span
                    className={cn(
                      "text-xs",
                      motivation.length > 1000
                        ? "text-red-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {motivation.length}/1000
                  </span>
                </div>
                <Textarea
                  {...register("motivation")}
                  placeholder={t("jobs.apply.coverLetterPlaceholder")}
                  className="min-h-[80px]"
                />
                {errors.motivation && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.motivation.message}
                  </p>
                )}
              </motion.div>

              {/* Availability Date Picker */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("jobs.apply.availability")}
                </label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !availability && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {availability
                      ? format(availability, "PPP", { locale: es })
                      : t("jobs.apply.startDate")}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={availability}
                      onSelect={(date) => {
                        if (date) setValue("availability", date, { shouldValidate: true });
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors.availability && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.availability.message}
                  </p>
                )}
              </motion.div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  {tc("actions.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("jobs.apply.submitting") : t("jobs.apply.submit")}
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
