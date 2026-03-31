import { getJobApplications } from "@/lib/actions/applications";
import { CandidatesClient } from "./candidates-client";

export const metadata = {
  title: "Candidatos | Syneria",
};

export default async function CandidatesPage() {
  const candidates = await getJobApplications();
  return <CandidatesClient initialCandidates={candidates} />;
}
