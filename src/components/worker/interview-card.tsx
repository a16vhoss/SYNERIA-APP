"use client";

import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { InterviewData } from "@/lib/actions/applications";

interface InterviewCardProps {
  companyName: string;
  jobTitle: string;
  interview: InterviewData;
  onConfirm: () => void;
  onDecline: () => void;
}

function getCountdownLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Pasada";
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Manana";
  return `En ${diffDays} dias`;
}

function formatInterviewDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function InterviewCard({
  companyName,
  jobTitle,
  interview,
  onConfirm,
  onDecline,
}: InterviewCardProps) {
  const countdown = getCountdownLabel(interview.date);
  const isPast = countdown === "Pasada";
  const isConfirmed = interview.confirmed === true;
  const isDeclined = interview.confirmed === false;
  const isPending = interview.confirmed === null;

  return (
    <motion.div
      className="flex flex-col gap-4 rounded-lg border border-violet-200 bg-violet-50/50 p-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-heading text-sm font-semibold text-foreground">
            {companyName}
          </h4>
          <p className="text-xs text-muted-foreground">{jobTitle}</p>
        </div>
        <motion.span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            isPast
              ? "bg-gray-100 text-gray-600"
              : countdown === "Hoy"
                ? "bg-amber-100 text-amber-700"
                : "bg-violet-100 text-violet-700"
          )}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {countdown}
        </motion.span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4 text-violet-500" />
          <span>{formatInterviewDate(interview.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 text-violet-500" />
          <span>{interview.time}</span>
        </div>
        <div>
          <a
            href={interview.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-700"
          >
            <Video className="size-3.5" />
            Unirse a la llamada
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* Employer Notes */}
      {interview.notes && (
        <div className="flex items-start gap-2 rounded-md bg-white/60 p-3">
          <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{interview.notes}</p>
        </div>
      )}

      {/* Response Status / Actions */}
      {isConfirmed && (
        <motion.div
          className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle2 className="size-4" />
          Asistencia confirmada
        </motion.div>
      )}

      {isDeclined && (
        <motion.div
          className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <XCircle className="size-4" />
          No puedes asistir - notificado al empleador
        </motion.div>
      )}

      {isPending && !isPast && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            <CheckCircle2 className="mr-1.5 size-3.5" />
            Confirmar Asistencia
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDecline();
            }}
          >
            <XCircle className="mr-1.5 size-3.5" />
            No Puedo Asistir
          </Button>
        </div>
      )}
    </motion.div>
  );
}
