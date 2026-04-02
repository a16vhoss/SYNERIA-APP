import {
  getWorkerApplications,
  getApplicationInterviews,
} from "@/lib/actions/applications";
import { ApplicationsClient } from "./applications-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: `${t("nav.myApplications")} | Syneria` };
}

export default async function ApplicationsPage() {
  const [applications, interviews] = await Promise.all([
    getWorkerApplications(),
    getApplicationInterviews(),
  ]);

  // Build interviews map keyed by applicationId
  const interviewsMap: Record<
    string,
    { applicationId: string; date: string; time: string; videoLink: string; notes?: string; confirmed?: boolean | null }
  > = {};
  for (const iv of interviews) {
    interviewsMap[iv.applicationId] = iv;
  }

  return (
    <ApplicationsClient
      initialApplications={applications}
      initialInterviews={interviewsMap}
    />
  );
}
