"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  Calendar,
  Globe,
  Star,
  Users,
  Timer,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SummaryItem {
  icon: React.ElementType;
  label: string;
  value: string;
}

interface SimilarJob {
  id: string;
  title: string;
  companyName: string;
  companyLetter: string;
  companyGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  salary: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  letter: string;
  gradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  description: string;
  employees: string;
  rating: number;
}

interface JobDetailSidebarProps {
  summary: SummaryItem[];
  company: CompanyInfo;
  similarJobs: SimilarJob[];
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : i < rating
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
      delay: 0.2 + i * 0.12,
    },
  }),
};

export function JobDetailSidebar({
  summary,
  company,
  similarJobs,
  className,
}: JobDetailSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Job Summary */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Empleo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {summary.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* About Company */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle>Sobre la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <CompanyAvatar
              letter={company.letter}
              gradient={company.gradient}
              size="lg"
            />
            <h4 className="font-heading text-sm font-semibold text-foreground">
              {company.name}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {company.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" />
                {company.employees}
              </span>
              <StarRating rating={company.rating} />
            </div>
            <Link href={`/company/${company.id}`}>
              <Button variant="outline" size="sm" className="mt-1">
                Ver perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Similar Jobs */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle>Empleos Similares</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {similarJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <CompanyAvatar
                  letter={job.companyLetter}
                  gradient={job.companyGradient}
                  size="sm"
                />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground group-hover:text-brand-600 transition-colors">
                    {job.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {job.companyName}
                  </span>
                </div>
                <span className="text-xs font-medium text-emerald-600">
                  {job.salary}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export type { SummaryItem, SimilarJob, CompanyInfo };
