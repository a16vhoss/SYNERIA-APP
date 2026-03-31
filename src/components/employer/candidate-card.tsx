"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Eye,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { StarRating } from "@/components/shared/star-rating";
import { InterviewFeedbackPanel } from "@/components/employer/interview-feedback-panel";
import type { MockCandidate } from "@/lib/constants/mock-data";

const AVATAR_GRADIENTS = [
  "green",
  "orange",
  "purple",
  "blue",
  "red",
  "teal",
] as const;

function getGradient(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Mock cover letter / motivation data
const MOCK_DETAILS: Record<
  string,
  { coverLetter: string; motivation: string; cvLink: string }
> = {
  "cand-001": {
    coverLetter:
      "Soy un profesional con 5 anos de experiencia en construccion. He trabajado en proyectos residenciales y comerciales. Me interesa crecer profesionalmente en el sector.",
    motivation:
      "Busco oportunidades internacionales que me permitan ampliar mi experiencia y contribuir con mis habilidades tecnicas.",
    cvLink: "#",
  },
  "cand-002": {
    coverLetter:
      "Cuento con experiencia en hoteleria de alto nivel. Domino espanol, ingles y frances. Me apasiona brindar un servicio excepcional.",
    motivation:
      "El puesto en Barcelona representa la oportunidad perfecta para combinar mi experiencia con mi amor por la cultura espanola.",
    cvLink: "#",
  },
  "cand-003": {
    coverLetter:
      "Operador certificado con licencia para maquinaria pesada. He trabajado en obras civiles de gran envergadura.",
    motivation:
      "Alemania ofrece un entorno profesional que valoro mucho. Quiero aportar mi experiencia a proyectos de primer nivel.",
    cvLink: "#",
  },
};

interface CandidateCardProps {
  candidate: MockCandidate;
  onStatusChange: (status: MockCandidate["status"]) => void;
  onScheduleInterview: () => void;
}

export function CandidateCard({
  candidate,
  onStatusChange,
  onScheduleInterview,
}: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const details = MOCK_DETAILS[candidate.id];
  const canSchedule =
    candidate.status === "pending" || candidate.status === "reviewing";
  const showFeedback = candidate.status === "interview";

  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-xl border border-white/20 bg-white/60 backdrop-blur-md shadow-[var(--shadow-card)]",
        "transition-shadow"
      )}
      whileHover={{
        y: -2,
        boxShadow:
          "0 8px 30px rgba(0,0,0,0.08), 0 0 1px rgba(255,255,255,0.3) inset",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <CompanyAvatar
            letter={candidate.name.charAt(0)}
            gradient={getGradient(candidate.name)}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-heading text-sm font-semibold text-foreground">
                {candidate.name}
              </h3>
              <StatusBadge status={candidate.status} size="sm" />
            </div>

            <div className="mt-0.5 flex items-center gap-2">
              <StarRating rating={candidate.rating} size="sm" showValue />
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {candidate.role_applied}
            </p>

            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {candidate.email}
              </span>
              <span>{formatDate(candidate.applied_at)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            <Eye className="mr-1 size-3.5" />
            Ver Perfil
            <ChevronDown
              className={cn(
                "ml-1 size-3 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </Button>

          {canSchedule && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-violet-600 border-violet-200 hover:bg-violet-50"
              onClick={onScheduleInterview}
            >
              <CalendarPlus className="mr-1 size-3.5" />
              Agendar Entrevista
            </Button>
          )}

          {candidate.status !== "accepted" && candidate.status !== "rejected" && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                onClick={() => onStatusChange("accepted")}
              >
                <CheckCircle2 className="mr-1 size-3.5" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-xs text-red-600 hover:bg-red-50"
                onClick={() => onStatusChange("rejected")}
              >
                <XCircle className="mr-1 size-3.5" />
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
              {details ? (
                <>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Carta de presentacion
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {details.coverLetter}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Motivacion
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {details.motivation}
                    </p>
                  </div>

                  <a
                    href={details.cvLink}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <FileText className="size-3.5" />
                    Descargar CV
                  </a>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay detalles adicionales disponibles.
                </p>
              )}

              {/* Interview feedback panel */}
              {showFeedback && (
                <InterviewFeedbackPanel
                  candidateId={candidate.id}
                  candidateName={candidate.name}
                  onAccept={() => onStatusChange("accepted")}
                  onReject={() => onStatusChange("rejected")}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
