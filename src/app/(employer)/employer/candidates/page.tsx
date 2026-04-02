import { getJobApplications } from "@/lib/actions/applications";
import { CandidatesClient } from "./candidates-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: `${t("nav.candidates")} | Syneria` };
}

export default async function CandidatesPage() {
  const candidates = await getJobApplications();
  return <CandidatesClient initialCandidates={candidates} />;
}
