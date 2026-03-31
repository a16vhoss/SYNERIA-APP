"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Briefcase,
  Globe,
  Timer,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { JobDetailContent } from "@/components/worker/job-detail-content";
import {
  JobDetailSidebar,
  type SummaryItem,
  type SimilarJob,
  type CompanyInfo,
} from "@/components/worker/job-detail-sidebar";
import { ApplyModal } from "@/components/worker/apply-modal";
import { MOCK_JOBS } from "@/lib/constants/mock-data";

/* ------------------------------------------------------------------ */
/*  Extended mock data for the detail page                             */
/* ------------------------------------------------------------------ */

interface JobDetail {
  id: string;
  title: string;
  companyName: string;
  companyLetter: string;
  companyGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  sector: string;
  location: string;
  flag: string;
  postedAgo: string;
  salary: string;
  tags: { label: string; variant: string }[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  summary: {
    sector: string;
    type: string;
    experience: string;
    languages: string;
    startDate: string;
    duration: string;
  };
  company: {
    id: string;
    name: string;
    description: string;
    employees: string;
    rating: number;
  };
}

const MOCK_JOB_DETAILS: Record<string, JobDetail> = {
  job_001: {
    id: "job_001",
    title: "Ayudante de Construccion Senior",
    companyName: "Constructora Alpha S.A.",
    companyLetter: "C",
    companyGradient: "green",
    sector: "Construccion",
    location: "Santiago, Chile",
    flag: "\uD83C\uDDE8\uD83C\uDDF1",
    postedAgo: "Hace 3 dias",
    salary: "$3,200/mes + beneficios",
    tags: [
      { label: "Jornada Completa", variant: "default" },
      { label: "Visa", variant: "visa" },
      { label: "Alojamiento", variant: "housing" },
      { label: "Urgente", variant: "urgent" },
    ],
    description:
      "Estamos buscando un Ayudante de Construccion Senior experimentado para unirse a nuestro equipo de trabajo en Santiago de Chile. El candidato ideal tendra experiencia previa en el sector de la construccion, especificamente en proyectos habitacionales e infraestructura de gran escala.\n\nEl puesto ofrece excelentes condiciones laborales, incluyendo visa de trabajo patrocinada, alojamiento proporcionado por la empresa y un paquete completo de beneficios.\n\nNuestro equipo trabaja en algunos de los proyectos de construccion mas importantes de la region, brindando oportunidades de crecimiento profesional y desarrollo de habilidades.",
    responsibilities: [
      "Asistir en todas las fases de construccion de proyectos habitacionales",
      "Preparar materiales y herramientas necesarias para la obra",
      "Mantener el area de trabajo limpia y segura",
      "Colaborar con otros miembros del equipo de construccion",
      "Reportar al supervisor de obra sobre el avance diario",
      "Seguir estrictamente los protocolos de seguridad en obra",
      "Participar en capacitaciones y entrenamientos de seguridad",
    ],
    requirements: [
      "Minimo 3 anos de experiencia en construccion",
      "Conocimiento basico de herramientas de construccion",
      "Capacidad para realizar trabajo fisico demandante",
      "Disponibilidad para trabajar en horarios rotativos",
      "Documentacion vigente para trabajar en el extranjero",
      "Espanol fluido (ingles basico es un plus)",
      "Certificaciones de seguridad laboral (deseable)",
    ],
    benefits: [
      "Salario competitivo de $3,200/mes",
      "Visa de trabajo patrocinada por la empresa",
      "Alojamiento gratuito proporcionado",
      "Seguro medico completo",
      "Bonos por desempeno trimestral",
      "Transporte ida y vuelta al sitio de obra",
      "Capacitacion continua y certificaciones",
      "Oportunidades de ascenso interno",
    ],
    summary: {
      sector: "Construccion",
      type: "Jornada Completa",
      experience: "3+ anos",
      languages: "Espanol (Ingles basico)",
      startDate: "Inmediata",
      duration: "12 meses (renovable)",
    },
    company: {
      id: "comp-001",
      name: "Constructora Alpha S.A.",
      description:
        "Empresa lider en construccion e infraestructura con mas de 20 anos de experiencia en Latinoamerica.",
      employees: "500+",
      rating: 4.5,
    },
  },
};

function getJobDetail(id: string): JobDetail {
  if (MOCK_JOB_DETAILS[id]) return MOCK_JOB_DETAILS[id];

  // Generate a detail from MOCK_JOBS if available
  const job = MOCK_JOBS.find((j) => j.id === id);
  return {
    id: id,
    title: job?.title ?? "Puesto de Trabajo",
    companyName: job?.companyName ?? "Empresa",
    companyLetter: job?.companyLetter ?? "E",
    companyGradient: job?.companyGradient ?? "green",
    sector: "Construccion",
    location: job?.location ?? "Ubicacion por definir",
    flag: "\uD83C\uDDE8\uD83C\uDDF1",
    postedAgo: "Hace 5 dias",
    salary: job?.salary ?? "$2,500/mes",
    tags: job?.tags?.map((t) => ({ label: t.label, variant: t.variant ?? "default" })) ?? [],
    description:
      "Descripcion detallada del puesto de trabajo. Buscamos un profesional con experiencia para unirse a nuestro equipo en un ambiente dinamico y colaborativo.\n\nOfrecemos excelentes condiciones laborales y oportunidades de desarrollo profesional.",
    responsibilities: [
      "Ejecutar tareas asignadas segun el plan de trabajo",
      "Colaborar con el equipo en proyectos activos",
      "Mantener altos estandares de calidad en el trabajo",
      "Reportar avances al supervisor directo",
    ],
    requirements: [
      "Experiencia previa en el area",
      "Disponibilidad para trabajo presencial",
      "Buenas habilidades de comunicacion",
      "Documentacion al dia",
    ],
    benefits: [
      "Salario competitivo",
      "Seguro medico",
      "Oportunidades de crecimiento",
      "Ambiente laboral positivo",
    ],
    summary: {
      sector: "General",
      type: "Jornada Completa",
      experience: "2+ anos",
      languages: "Espanol",
      startDate: "Por definir",
      duration: "Indefinido",
    },
    company: {
      id: "comp-001",
      name: job?.companyName ?? "Empresa",
      description:
        "Empresa con presencia en el mercado latinoamericano.",
      employees: "100+",
      rating: 4.0,
    },
  };
}

const tagColors: Record<string, string> = {
  visa: "bg-sky-100 text-sky-700",
  housing: "bg-violet-100 text-violet-700",
  urgent: "bg-rose-100 text-rose-700",
  default: "bg-muted text-muted-foreground",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface JobDetailClientProps {
  jobId: string;
}

export function JobDetailClient({ jobId }: JobDetailClientProps) {
  const job = getJobDetail(jobId);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const summaryItems: SummaryItem[] = [
    { icon: Briefcase, label: "Sector", value: job.summary.sector },
    { icon: Clock, label: "Tipo", value: job.summary.type },
    { icon: Timer, label: "Experiencia", value: job.summary.experience },
    { icon: Globe, label: "Idiomas", value: job.summary.languages },
    { icon: Calendar, label: "Fecha inicio", value: job.summary.startDate },
    { icon: Clock, label: "Duracion", value: job.summary.duration },
  ];

  const similarJobs: SimilarJob[] = MOCK_JOBS.filter((j) => j.id !== jobId)
    .slice(0, 3)
    .map((j) => ({
      id: j.id,
      title: j.title,
      companyName: j.companyName,
      companyLetter: j.companyLetter,
      companyGradient: j.companyGradient ?? "green",
      salary: j.salary,
    }));

  const companyInfo: CompanyInfo = {
    id: job.company.id,
    name: job.company.name,
    letter: job.companyLetter,
    gradient: job.companyGradient,
    description: job.company.description,
    employees: job.company.employees,
    rating: job.company.rating,
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <motion.nav
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/jobs"
            className="hover:text-foreground transition-colors"
          >
            Empleos
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium truncate max-w-[300px]">
            {job.title}
          </span>
        </motion.nav>

        {/* Main grid: content + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Job Header Card */}
            <motion.div
              className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="flex flex-col gap-4">
                {/* Company + sector tag */}
                <div className="flex items-center gap-3">
                  <CompanyAvatar
                    letter={job.companyLetter}
                    gradient={job.companyGradient}
                    size="lg"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {job.companyName}
                    </span>
                    <span className="inline-flex w-fit rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
                      {job.sector}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {job.title}
                </h1>

                {/* Location + time */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span>{job.flag}</span>
                    <MapPin className="size-3.5" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {job.postedAgo}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        tagColors[tag.variant] ?? tagColors.default
                      )}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>

                {/* Salary */}
                <span className="text-lg font-bold text-emerald-600">
                  {job.salary}
                </span>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setApplyOpen(true)} size="lg">
                    Aplicar Ahora
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSaved(!saved)}
                  >
                    {saved ? (
                      <BookmarkCheck className="mr-1.5 size-4 text-brand-600" />
                    ) : (
                      <Bookmark className="mr-1.5 size-4" />
                    )}
                    {saved ? "Guardado" : "Guardar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-1.5 size-4" />
                    {copied ? "Copiado!" : "Compartir"}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Content tabs */}
            <motion.div
              className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 shadow-[var(--shadow-card)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
                delay: 0.1,
              }}
            >
              <JobDetailContent
                description={job.description}
                responsibilities={job.responsibilities}
                requirements={job.requirements}
                benefits={job.benefits}
              />
            </motion.div>
          </div>

          {/* Right sidebar */}
          <JobDetailSidebar
            summary={summaryItems}
            company={companyInfo}
            similarJobs={similarJobs}
            className="hidden lg:flex"
          />

          {/* Mobile sidebar - stacked below */}
          <JobDetailSidebar
            summary={summaryItems}
            company={companyInfo}
            similarJobs={similarJobs}
            className="lg:hidden"
          />
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        open={applyOpen}
        onOpenChange={setApplyOpen}
        jobTitle={job.title}
        companyName={job.companyName}
      />
    </>
  );
}
