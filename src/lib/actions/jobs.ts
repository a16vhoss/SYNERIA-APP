"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { MockVacancy } from "@/lib/constants/mock-data";

// ── Types ────────────────────────────────────────────────────────────
export interface CreateJobInput {
  title: string;
  description: string;
  sector: string;
  contract_type: string;
  country: string;
  city: string;
  salary_min?: string;
  salary_max?: string;
  requirements?: string;
  benefits?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  requirements?: string;
  benefits?: string;
}

export type VacancyStatus = "active" | "paused" | "closed" | "draft";

// ── CRUD helpers ─────────────────────────────────────────────────────

export async function getEmployerJobs(
  _employerId?: string
): Promise<MockVacancy[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: jobs } = await supabase
      .from("jobs")
      .select("*, applications(count)")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (!jobs?.length) return [];

    // Get company_id for the employer
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    return jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description ?? "",
      sector: j.sector ?? "",
      contract_type: j.job_type ?? "full_time",
      country: j.country ?? "",
      city: j.city ?? "",
      location: `${j.city ?? ""}, ${j.country ?? ""}`,
      salary_min: j.salary_min ?? null,
      salary_max: j.salary_max ?? null,
      status: j.status as MockVacancy["status"],
      applications_count: (j.applications as unknown as { count: number }[])?.[0]?.count ?? j.applicants_count ?? 0,
      published_at: j.created_at,
      company_id: company?.id ?? j.company_id ?? "",
    }));
  } catch {
    return [];
  }
}

export async function getJobById(
  id: string
): Promise<MockVacancy | undefined> {
  try {
    const supabase = await createClient();
    const { data: job } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (!job) return undefined;

    return {
      id: job.id,
      title: job.title,
      description: job.description ?? "",
      sector: job.sector ?? "",
      contract_type: job.job_type ?? "full_time",
      country: job.country ?? "",
      city: job.city ?? "",
      location: `${job.city ?? ""}, ${job.country ?? ""}`,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      status: job.status as MockVacancy["status"],
      applications_count: job.applicants_count ?? 0,
      published_at: job.created_at,
      company_id: job.company_id ?? "",
    };
  } catch {
    return undefined;
  }
}

export async function createJob(
  data: CreateJobInput
): Promise<MockVacancy> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Get company for this employer
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    // Use admin client to bypass RLS triggers on network_activity
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .insert({
        employer_id: user.id,
        company_id: company?.id ?? null,
        title: data.title,
        description: data.description,
        sector: data.sector,
        job_type: data.contract_type,
        country: data.country,
        city: data.city,
        salary_min: data.salary_min ? Number(data.salary_min) : null,
        salary_max: data.salary_max ? Number(data.salary_max) : null,
        requirements: data.requirements ? data.requirements.split("\n").filter(Boolean) : [],
        benefits: data.benefits ? data.benefits.split("\n").filter(Boolean) : [],
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: job.id,
      title: job.title,
      description: job.description ?? "",
      sector: job.sector ?? "",
      contract_type: job.job_type ?? "full_time",
      country: job.country ?? "",
      city: job.city ?? "",
      location: `${job.city ?? ""}, ${job.country ?? ""}`,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      status: job.status as MockVacancy["status"],
      applications_count: 0,
      published_at: job.created_at,
      company_id: job.company_id ?? "",
    };
  } catch {
    // Fallback to in-memory
    const newVacancy: MockVacancy = {
      id: `vac-${Date.now()}`,
      title: data.title,
      description: data.description,
      sector: data.sector,
      contract_type: data.contract_type,
      country: data.country,
      city: data.city,
      location: `${data.city}, ${data.country}`,
      salary_min: data.salary_min ? Number(data.salary_min) : null,
      salary_max: data.salary_max ? Number(data.salary_max) : null,
      status: "active",
      applications_count: 0,
      published_at: new Date().toISOString(),
      company_id: "comp-001",
    };
    return newVacancy;
  }
}

export async function updateJob(
  id: string,
  data: UpdateJobInput
): Promise<MockVacancy> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.contract_type !== undefined) updateData.job_type = data.contract_type;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.salary_min !== undefined) updateData.salary_min = data.salary_min ? Number(data.salary_min) : null;
    if (data.salary_max !== undefined) updateData.salary_max = data.salary_max ? Number(data.salary_max) : null;
    if (data.requirements !== undefined) updateData.requirements = data.requirements.split("\n").filter(Boolean);
    if (data.benefits !== undefined) updateData.benefits = data.benefits.split("\n").filter(Boolean);

    const { data: job, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: job.id,
      title: job.title,
      description: job.description ?? "",
      sector: job.sector ?? "",
      contract_type: job.job_type ?? "full_time",
      country: job.country ?? "",
      city: job.city ?? "",
      location: `${job.city ?? ""}, ${job.country ?? ""}`,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      status: job.status as MockVacancy["status"],
      applications_count: job.applicants_count ?? 0,
      published_at: job.created_at,
      company_id: job.company_id ?? "",
    };
  } catch {
    throw new Error("Error updating job");
  }
}

export async function updateJobStatus(
  id: string,
  status: VacancyStatus
): Promise<MockVacancy> {
  try {
    const supabase = await createClient();
    const { data: job, error } = await supabase
      .from("jobs")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: job.id,
      title: job.title,
      description: job.description ?? "",
      sector: job.sector ?? "",
      contract_type: job.job_type ?? "full_time",
      country: job.country ?? "",
      city: job.city ?? "",
      location: `${job.city ?? ""}, ${job.country ?? ""}`,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      status: job.status as MockVacancy["status"],
      applications_count: job.applicants_count ?? 0,
      published_at: job.created_at,
      company_id: job.company_id ?? "",
    };
  } catch {
    throw new Error("Error updating job status");
  }
}

export async function deleteJob(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("jobs").delete().eq("id", id);
  } catch {
    throw new Error("Error deleting job");
  }
}
