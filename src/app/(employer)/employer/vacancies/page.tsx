import { createClient } from "@/lib/supabase/server";
import { type MockVacancy } from "@/lib/constants/mock-data";
import { VacanciesClient } from "./vacancies-client";

export const metadata = {
  title: "Gestion de Vacantes | Syneria",
};

async function getVacancies(): Promise<MockVacancy[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Fetch jobs created by this employer
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*, applications(count)")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (!jobs || jobs.length === 0) return [];

    return jobs.map((j) => ({
      id: j.id,
      title: j.title ?? "",
      location: `${j.city ?? ""}, ${j.country ?? ""}`,
      country: j.country ?? "",
      city: j.city ?? "",
      sector: j.sector ?? "",
      contract_type: j.job_type ?? "full_time",
      salary_min: j.salary_min ?? null,
      salary_max: j.salary_max ?? null,
      description: j.description ?? "",
      status: (j.status as "active" | "paused" | "closed" | "draft") ?? "active",
      applications_count: (j.applications as unknown as { count: number }[])?.[0]?.count ?? j.applicants_count ?? 0,
      published_at: j.created_at ?? new Date().toISOString(),
      company_id: j.company_id ?? "",
    }));
  } catch {
    return [];
  }
}

export default async function VacanciesPage() {
  const vacancies = await getVacancies();

  return <VacanciesClient initialVacancies={vacancies} />;
}
