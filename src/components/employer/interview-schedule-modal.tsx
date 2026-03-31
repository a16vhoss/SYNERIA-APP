"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { CalendarIcon, Clock, Link2, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const scheduleSchema = z.object({
  date: z.date({ message: "Selecciona una fecha" }),
  time: z.string().min(1, "Ingresa la hora"),
  videoLink: z.url("Ingresa una URL valida"),
  notes: z.string().max(500, "Maximo 500 caracteres").optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface InterviewScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  onSchedule: () => void;
}

export function InterviewScheduleModal({
  open,
  onOpenChange,
  candidateName,
  onSchedule,
}: InterviewScheduleModalProps) {
  const t = useTranslations("employer");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema) as any,
    defaultValues: {
      time: "",
      videoLink: "",
      notes: "",
    },
  });

  const selectedDate = watch("date");

  async function onSubmit(_data: ScheduleFormValues) {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    onSchedule();
    setTimeout(() => {
      handleClose();
    }, 1500);
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="flex flex-col items-center gap-3 py-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="flex size-14 items-center justify-center rounded-full bg-violet-100"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 12,
                  delay: 0.1,
                }}
              >
                <CalendarIcon className="size-7 text-violet-600" />
              </motion.div>
              <p className="font-heading text-base font-semibold">
                {t("candidates.interview.scheduled")}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                {t("candidates.interview.notified", { name: candidateName })}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <DialogHeader>
                <DialogTitle>
                  {t("candidates.interview.schedule")} - {candidateName}
                </DialogTitle>
                <DialogDescription>
                  {t("candidates.interview.description")}
                </DialogDescription>
              </DialogHeader>

              {/* Date Picker */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <CalendarIcon className="mr-1 inline size-3.5" />
                  {t("candidates.interview.date")}
                </label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate
                      ? format(selectedDate, "PPP", { locale: es })
                      : t("candidates.interview.date")}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date)
                          setValue("date", date, { shouldValidate: true });
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </motion.div>

              {/* Time */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Clock className="mr-1 inline size-3.5" />
                  {t("candidates.interview.time")}
                </label>
                <Input
                  type="time"
                  {...register("time")}
                  className="w-full"
                />
                {errors.time && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.time.message}
                  </p>
                )}
              </motion.div>

              {/* Video Link */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Link2 className="mr-1 inline size-3.5" />
                  {t("candidates.interview.type")}
                </label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  {...register("videoLink")}
                  className="w-full"
                />
                {errors.videoLink && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.videoLink.message}
                  </p>
                )}
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <MessageSquare className="mr-1 inline size-3.5" />
                  {t("candidates.interview.notes")}
                </label>
                <Textarea
                  {...register("notes")}
                  placeholder={t("candidates.interview.notes")}
                  className="min-h-[80px]"
                />
                {errors.notes && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.notes.message}
                  </p>
                )}
              </motion.div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  {t("candidates.interview.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isSubmitting ? t("candidates.interview.scheduling") : t("candidates.interview.confirm")}
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
