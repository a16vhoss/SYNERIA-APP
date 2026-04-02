"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
/* ------------------------------------------------------------------ */
/*  Job detail types                                                   */
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

function buildJobDetail(data: JobDetailClientProps["jobData"]): JobDetail {
  return {
    id: data.id,
    title: data.title,
    companyName: data.companyName,
    companyLetter: data.companyLetter,
    companyGradient: data.companyGradient as JobDetail["companyGradient"],
    sector: data.sector,
    location: data.location,
    flag: data.flag,
    postedAgo: data.postedAgo,
    salary: data.salary,
    tags: data.tags,
    description: data.description,
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    benefits: data.benefits,
    summary: data.summary,
    company: data.company,
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
  jobData: {
    id: string;
    title: string;
    companyName: string;
    companyLetter: string;
    companyGradient: string;
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
  };
  similarJobs?: { id: string; title: string; salary: string; companyName: string }[];
}

export function JobDetailClient({ jobId, jobData, similarJobs: similarJobsProp }: JobDetailClientProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const job = buildJobDetail(jobData);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const summaryItems: SummaryItem[] = [
    { icon: Briefcase, label: t("jobs.filters.category"), value: job.summary.sector },
    { icon: Clock, label: t("jobs.detail.type"), value: job.summary.type },
    { icon: Timer, label: t("jobs.filters.experience"), value: job.summary.experience },
    { icon: Globe, label: t("jobs.detail.location"), value: job.summary.languages },
    { icon: Calendar, label: t("contracts.detail.startDate"), value: job.summary.startDate },
    { icon: Clock, label: t("contracts.detail.endDate"), value: job.summary.duration },
  ];

  const similarJobs: SimilarJob[] = (similarJobsProp ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    companyName: j.companyName,
    companyLetter: j.companyName.charAt(0),
    companyGradient: "green",
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
      <div className="flex flex-col gap-6 overflow-x-hidden">
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
            {t("jobs.title")}
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
              className="rounded-xl bg-card p-4 sm:p-6 ring-1 ring-foreground/10 shadow-[var(--shadow-card)]"
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
                <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl break-words">
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
                  <Button onClick={() => setApplyOpen(true)} size="default" className="sm:size-auto">
                    {t("jobs.detail.applyNow")}
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setSaved(!saved)}
                  >
                    {saved ? (
                      <BookmarkCheck className="mr-1.5 size-4 text-brand-600" />
                    ) : (
                      <Bookmark className="mr-1.5 size-4" />
                    )}
                    {saved ? t("jobs.detail.savedJob") : t("jobs.detail.saveJob")}
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-1.5 size-4" />
                    {copied ? tc("misc.copiedToClipboard") : t("jobs.detail.shareJob")}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Content tabs */}
            <motion.div
              className="rounded-xl bg-card p-4 sm:p-6 ring-1 ring-foreground/10 shadow-[var(--shadow-card)]"
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
        jobId={jobId}
        jobTitle={job.title}
        companyName={job.companyName}
      />
    </>
  );
}
