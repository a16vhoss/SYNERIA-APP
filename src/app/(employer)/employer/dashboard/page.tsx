import { createClient } from "@/lib/supabase/server";
import { EmployerDashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard Employer | Syneria",
};

async function getEmployerData() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        company: { id: "", name: "Mi Empresa", sector: "", country: "", city: "", description: "", verified: false, logo_url: null },
        vacancies: [],
        candidates: [],
        stats: { activeVacancies: 0, totalCandidates: 0, inInterview: 0, accepted: 0 },
      };
    }

    // Try to fetch the employer's company
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, companies(*)")
      .eq("id", user.id)
      .single();

    if (!profile?.companies) {
      return {
        company: { id: "", name: "Mi Empresa", sector: "", country: "", city: "", description: "", verified: false, logo_url: null },
        vacancies: [],
        candidates: [],
        stats: { activeVacancies: 0, totalCandidates: 0, inInterview: 0, accepted: 0 },
      };
    }

    const company = profile.companies;

    // Fetch vacancies for this company
    const { data: vacancies } = await supabase
      .from("vacancies")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (!vacancies || vacancies.length === 0) {
      return {
        company: {
          id: company.id,
          name: company.name ?? "Mi Empresa",
          sector: company.sector ?? "",
          logo_url: company.logo_url ?? null,
          verified: company.verified ?? false,
          country: company.country ?? "",
          city: company.city ?? "",
          description: company.description ?? "",
        },
        vacancies: [],
        candidates: [],
        stats: { activeVacancies: 0, totalCandidates: 0, inInterview: 0, accepted: 0 },
      };
    }

    // Fetch candidates for employer's vacancies
    const vacancyIds = vacancies.map((v: { id: string }) => v.id);
    const { data: candidates } = await supabase
      .from("applications")
      .select("*")
      .in("vacancy_id", vacancyIds);

    const candidatesList = candidates ?? [];

    const stats = {
      activeVacancies: vacancies.filter((v: { status: string }) => v.status === "active").length,
      totalCandidates: candidatesList.length,
      inInterview: candidatesList.filter((c: { status: string }) => c.status === "interview").length,
      accepted: candidatesList.filter((c: { status: string }) => c.status === "accepted").length,
    };

    return {
      company: {
        id: company.id,
        name: company.name ?? "Mi Empresa",
        sector: company.sector ?? "",
        logo_url: company.logo_url ?? null,
        verified: company.verified ?? false,
        country: company.country ?? "",
        city: company.city ?? "",
        description: company.description ?? "",
      },
      vacancies: vacancies.map((v: Record<string, unknown>) => ({
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
        status: (v.status as "active" | "paused" | "closed" | "draft") ?? "active",
        applications_count: candidatesList.filter((c: { vacancy_id: string }) => c.vacancy_id === v.id).length,
        published_at: (v.created_at as string) ?? new Date().toISOString(),
        company_id: (v.company_id as string) ?? "",
      })),
      candidates: candidatesList,
      stats,
    };
  } catch {
    return {
      company: { id: "", name: "Mi Empresa", sector: "", country: "", city: "", description: "", verified: false, logo_url: null },
      vacancies: [],
      candidates: [],
      stats: { activeVacancies: 0, totalCandidates: 0, inInterview: 0, accepted: 0 },
    };
  }
}

export default async function EmployerDashboardPage() {
  const { company, vacancies, stats } = await getEmployerData();

  return (
    <EmployerDashboardClient
      company={company}
      vacancies={vacancies}
      stats={stats}
    />
  );
}
