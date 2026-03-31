import { createClient } from "@/lib/supabase/server";
import {
  MOCK_VACANCIES,
  type MockVacancy,
} from "@/lib/constants/mock-data";
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

    if (!user) return MOCK_VACANCIES;

    // Get employer's company
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, companies(*)")
      .eq("id", user.id)
      .single();

    if (!profile?.companies) return MOCK_VACANCIES;

    const company = profile.companies;

    // Fetch vacancies
    const { data: vacancies } = await supabase
      .from("vacancies")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (!vacancies || vacancies.length === 0) return MOCK_VACANCIES;

    // Fetch application counts
    const vacancyIds = vacancies.map((v: { id: string }) => v.id);
    const { data: applications } = await supabase
      .from("applications")
      .select("vacancy_id")
      .in("vacancy_id", vacancyIds);

    const appCounts: Record<string, number> = {};
    for (const app of applications ?? []) {
      appCounts[app.vacancy_id] = (appCounts[app.vacancy_id] ?? 0) + 1;
    }

    return vacancies.map((v: Record<string, unknown>) => ({
      id: v.id as string,
      title: (v.title as string) ?? "",
      location: `${v.city ?? ""}, ${v.country ?? ""}`,
      country: (v.country as string) ?? "",
      city: (v.city as string) ?? "",
      sector: (v.sector as string) ?? "",
      contract_type: (v.contract_type as string) ?? "full_time",
      salary_min: (v.salary_min as number) ?? null,
      salary_max: (v.salary_max as number) ?? null,
      description: (v.description as string) ?? "",
      status:
        (v.status as "active" | "paused" | "closed" | "draft") ?? "active",
      applications_count: appCounts[v.id as string] ?? 0,
      published_at: (v.created_at as string) ?? new Date().toISOString(),
      company_id: (v.company_id as string) ?? "",
    }));
  } catch {
    return MOCK_VACANCIES;
  }
}

export default async function VacanciesPage() {
  const vacancies = await getVacancies();

  return <VacanciesClient initialVacancies={vacancies} />;
}
