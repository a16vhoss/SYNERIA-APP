"use client";

import { useTranslations } from "next-intl";
import type { JobData } from "@/components/shared";
import type { MockStats } from "@/lib/constants/mock-data";
import { PageHeader } from "@/components/shared";
import { DashboardTabs } from "@/components/worker/dashboard-tabs";
import { DashboardStats } from "@/components/worker/dashboard-stats";
import { RecommendedJobs } from "@/components/worker/recommended-jobs";
import { InterviewBanner } from "@/components/worker/interview-banner";

interface DashboardData {
  firstName: string;
  stats: MockStats;
  jobs: JobData[];
  interview: {
    id: string;
    companyName: string;
    jobTitle: string;
    date: string;
    time: string;
  } | null;
}

export function WorkerDashboardClient({ data }: { data: DashboardData }) {
  const t = useTranslations("worker");

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <DashboardTabs />

      {/* Greeting */}
      <PageHeader
        title={t("dashboard.greeting", { name: data.firstName })}
        subtitle={t("dashboard.subtitle")}
      />

      {/* Interview banner (if upcoming) */}
      {data.interview && (
        <InterviewBanner
          companyName={data.interview.companyName}
          jobTitle={data.interview.jobTitle}
          date={data.interview.date}
          time={data.interview.time}
          interviewId={data.interview.id}
        />
      )}

      {/* Stat cards */}
      <DashboardStats
        availableJobs={data.stats.availableJobs}
        myApplications={data.stats.myApplications}
        notifications={data.stats.notifications}
        profileCompletion={data.stats.profileCompletion}
      />

      {/* Recommended jobs */}
      <RecommendedJobs jobs={data.jobs} />
    </div>
  );
}
