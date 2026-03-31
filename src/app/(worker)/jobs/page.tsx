import { createClient } from "@/lib/supabase/server";
import { JobsPageClient } from "./page-client";

async function getActiveJobs() {
  try {
    const supabase = await createClient();

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*, companies(name, logo_letter, logo_gradient)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!jobs?.length) return null;

    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;

    return jobs.map((j, i) => ({
      id: j.id,
      companyName: (j.companies as unknown as { name: string })?.name ?? "Empresa",
      companyLetter: ((j.companies as unknown as { logo_letter: string })?.logo_letter ?? j.title?.charAt(0) ?? "E"),
      companyGradient: ((j.companies as unknown as { logo_gradient: string })?.logo_gradient ?? gradients[i % gradients.length]) as typeof gradients[number],
      title: j.title,
      location: `${j.city ?? ""}, ${j.country ?? ""}`,
      salary: j.salary_display ?? (j.salary_min ? `$${j.salary_min.toLocaleString()}/mes` : ""),
      tags: [
        ...(j.visa_sponsorship ? [{ label: "Visa", variant: "visa" as const }] : []),
        ...(j.housing_included ? [{ label: "Alojamiento", variant: "housing" as const }] : []),
        ...(j.urgent ? [{ label: "Urgente", variant: "urgent" as const }] : []),
      ],
      sector: j.sector ?? "",
      country: j.country ?? "",
      salaryMin: j.salary_min ?? 0,
    }));
  } catch {
    return null;
  }
}

export default async function JobsPage() {
  const realJobs = await getActiveJobs();
  return <JobsPageClient realJobs={realJobs} />;
}
