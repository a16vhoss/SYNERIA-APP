import { createClient } from "@/lib/supabase/server";
import { JobDetailClient } from "./job-detail-client";
import { notFound } from "next/navigation";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, companies(id, name, logo_letter, logo_gradient, description, employees_count, rating)")
    .eq("id", id)
    .single();

  if (!job) return notFound();

  const { data: similarJobs } = await supabase
    .from("jobs")
    .select("id, title, salary_min, companies(name)")
    .eq("status", "active")
    .neq("id", id)
    .limit(3);

  // Transform job data for client component
  const company = job.companies as any;
  const jobData = {
    id: job.id,
    title: job.title ?? "Puesto de Trabajo",
    companyName: company?.name ?? "Empresa",
    companyLetter: company?.logo_letter ?? (company?.name?.charAt(0) ?? "E"),
    companyGradient: company?.logo_gradient ?? "green",
    sector: job.sector ?? "General",
    location: job.location ?? "Ubicacion por definir",
    flag: "",
    postedAgo: job.created_at
      ? `Hace ${Math.max(1, Math.round((Date.now() - new Date(job.created_at).getTime()) / 86400000))} dias`
      : "Reciente",
    salary: job.salary_min
      ? `$${job.salary_min.toLocaleString()}${job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ""}/mes`
      : "A convenir",
    tags: [] as { label: string; variant: string }[],
    description: job.description ?? "",
    responsibilities: (job.responsibilities as string[]) ?? [],
    requirements: (job.requirements as string[]) ?? [],
    benefits: (job.benefits as string[]) ?? [],
    summary: {
      sector: job.sector ?? "General",
      type: job.contract_type === "full_time" ? "Jornada Completa" : "Medio Tiempo",
      experience: job.experience_required ?? "No especificada",
      languages: job.languages ?? "Espanol",
      startDate: job.start_date ?? "Por definir",
      duration: job.duration ?? "Indefinido",
    },
    company: {
      id: company?.id ?? "",
      name: company?.name ?? "Empresa",
      description: company?.description ?? "",
      employees: company?.employees_count ? `${company.employees_count}+` : "N/A",
      rating: company?.rating ?? 0,
    },
  };

  const transformedSimilar = (similarJobs ?? []).map((sj: any) => ({
    id: sj.id,
    title: sj.title,
    salary: sj.salary_min ? `$${sj.salary_min.toLocaleString()}/mes` : "A convenir",
    companyName: sj.companies?.name ?? "Empresa",
  }));

  return (
    <JobDetailClient
      jobId={id}
      jobData={jobData}
      similarJobs={transformedSimilar}
    />
  );
}
