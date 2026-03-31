"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  MockApplication,
  MockCandidate,
} from "@/lib/constants/mock-data";

// ── Types ────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interview"
  | "accepted"
  | "rejected";

export interface CreateApplicationInput {
  jobId: string;
  coverLetter?: string;
  motivation?: string;
  availability?: string; // ISO date
  cvUrl?: string;
}

export interface ScheduleInterviewInput {
  applicationId: string;
  date: string; // ISO
  time: string;
  videoLink: string;
  notes?: string;
}

export interface InterviewData {
  applicationId: string;
  date: string;
  time: string;
  videoLink: string;
  notes?: string;
  confirmed?: boolean | null; // null = pending response
}

// ── Worker Actions ──────────────────────────────────────────────────

export async function createApplication(
  data: CreateApplicationInput
): Promise<MockApplication> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    const { data: inserted, error } = await supabase
      .from("applications")
      .insert({
        job_id: data.jobId,
        user_id: user.id,
        cover_letter: data.coverLetter ?? null,
        motivation: data.motivation ?? null,
        availability: data.availability ?? null,
        cv_url: data.cvUrl ?? null,
        status: "pending",
      })
      .select(
        `
        id,
        status,
        created_at,
        jobs:job_id (
          id,
          title,
          companies:company_id (
            name
          )
        )
      `
      )
      .single();

    if (error) throw error;

    const job = inserted.jobs as unknown as {
      id: string;
      title: string;
      companies: { name: string };
    };

    return {
      id: inserted.id,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companies?.name ?? "Empresa",
      status: inserted.status as ApplicationStatus,
      appliedAt: inserted.created_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
    };
  } catch (err) {
    console.error("createApplication error, returning mock:", err);
    const mock: MockApplication = {
      id: `app_${Date.now()}`,
      jobId: data.jobId,
      jobTitle: "Puesto",
      companyName: "Empresa",
      status: "pending",
      appliedAt: new Date().toISOString().split("T")[0],
    };
    return mock;
  }
}

export async function getWorkerApplications(): Promise<MockApplication[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    const { data: rows, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        created_at,
        interview_date,
        interview_link,
        interview_notes,
        interview_confirmed,
        jobs:job_id (
          id,
          title,
          companies:company_id (
            name,
            logo_letter,
            logo_gradient
          )
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    return rows.map((row) => {
      const job = row.jobs as unknown as {
        id: string;
        title: string;
        companies: { name: string; logo_letter: string; logo_gradient: string } | null;
      };
      return {
        id: row.id,
        jobId: job?.id ?? "",
        jobTitle: job?.title ?? "Sin titulo",
        companyName: job?.companies?.name ?? "Empresa",
        status: (row.status ?? "pending") as ApplicationStatus,
        appliedAt: row.created_at?.split("T")[0] ?? "",
        // Extra fields attached for interview data
        ...(row.interview_date
          ? {
              _interviewDate: row.interview_date,
              _interviewLink: row.interview_link,
              _interviewNotes: row.interview_notes,
              _interviewConfirmed: row.interview_confirmed,
            }
          : {}),
        ...(job?.companies
          ? {
              _logoLetter: job.companies.logo_letter,
              _logoGradient: job.companies.logo_gradient,
            }
          : {}),
      } as MockApplication;
    });
  } catch (err) {
    console.error("getWorkerApplications error:", err);
    return [];
  }
}

export async function getApplicationInterviews(): Promise<InterviewData[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    const { data: rows, error } = await supabase
      .from("applications")
      .select("id, interview_date, interview_link, interview_notes, interview_confirmed")
      .eq("user_id", user.id)
      .not("interview_date", "is", null)
      .order("interview_date", { ascending: true });

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    return rows.map((row) => {
      const dt = new Date(row.interview_date!);
      return {
        applicationId: row.id,
        date: dt.toISOString().split("T")[0],
        time: dt.toTimeString().slice(0, 5),
        videoLink: row.interview_link ?? "",
        notes: row.interview_notes ?? undefined,
        confirmed: row.interview_confirmed ?? null,
      };
    });
  } catch (err) {
    console.error("getApplicationInterviews error:", err);
    return [];
  }
}

export async function respondToInterview(
  applicationId: string,
  confirmed: boolean
): Promise<InterviewData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    const { data: updated, error } = await supabase
      .from("applications")
      .update({ interview_confirmed: confirmed })
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .select("id, interview_date, interview_link, interview_notes, interview_confirmed")
      .single();

    if (error) throw error;

    const dt = new Date(updated.interview_date!);
    return {
      applicationId: updated.id,
      date: dt.toISOString().split("T")[0],
      time: dt.toTimeString().slice(0, 5),
      videoLink: updated.interview_link ?? "",
      notes: updated.interview_notes ?? undefined,
      confirmed: updated.interview_confirmed ?? null,
    };
  } catch (err) {
    console.error("respondToInterview error:", err);
    throw new Error("No se pudo actualizar la entrevista");
  }
}

// ── Employer Actions ────────────────────────────────────────────────

export async function getJobApplications(
  jobId?: string
): Promise<MockCandidate[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    // First get employer's jobs to filter applications
    const { data: employerJobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("employer_id", user.id);

    const jobIds = jobId
      ? [jobId]
      : (employerJobs?.map((j) => j.id) ?? []);

    if (jobIds.length === 0) return [];

    const { data: rows, error } = await supabase
      .from("applications")
      .select("id, status, created_at, job_id, user_id, cover_letter, motivation")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    // Fetch profiles and jobs separately to avoid JOIN issues
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, rating")
      .in("id", userIds);

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title")
      .in("id", jobIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
    const jobMap = new Map(jobs?.map((j) => [j.id, j]) ?? []);

    return rows.map((row) => {
      const profile = profileMap.get(row.user_id);
      const job = jobMap.get(row.job_id);

      return {
        id: row.id,
        name: profile?.full_name ?? "Candidato",
        email: profile?.email ?? "",
        avatar_url: profile?.avatar_url ?? null,
        role_applied: job?.title ?? "",
        vacancy_id: row.job_id,
        status: (row.status ?? "pending") as ApplicationStatus,
        applied_at: row.created_at?.split("T")[0] ?? "",
        rating: profile?.rating ?? 0,
      };
    });
  } catch (err) {
    console.error("getJobApplications error:", err);
    return [];
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<MockCandidate> {
  try {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .select("id, status, created_at, job_id, user_id")
      .single();

    if (error) {
      console.error("updateApplicationStatus error:", error.message);
      throw error;
    }

    return {
      id: updated.id,
      name: "Candidato",
      email: "",
      avatar_url: null,
      role_applied: "",
      vacancy_id: updated.job_id,
      status: updated.status as ApplicationStatus,
      applied_at: updated.created_at?.split("T")[0] ?? "",
      rating: 0,
    };
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    throw new Error("No se pudo actualizar el estado");
  }
}

export async function scheduleInterview(
  applicationId: string,
  date: string,
  time: string,
  videoLink: string,
  notes?: string
): Promise<InterviewData> {
  try {
    const supabase = await createClient();

    // Combine date + time into a TIMESTAMPTZ value
    const interviewDate = new Date(`${date}T${time}:00`).toISOString();

    const { data: updated, error } = await supabase
      .from("applications")
      .update({
        status: "interview",
        interview_date: interviewDate,
        interview_link: videoLink,
        interview_notes: notes ?? null,
        interview_confirmed: null,
      })
      .eq("id", applicationId)
      .select("id, interview_date, interview_link, interview_notes, interview_confirmed")
      .single();

    if (error) throw error;

    const dt = new Date(updated.interview_date!);
    return {
      applicationId: updated.id,
      date: dt.toISOString().split("T")[0],
      time: dt.toTimeString().slice(0, 5),
      videoLink: updated.interview_link ?? "",
      notes: updated.interview_notes ?? undefined,
      confirmed: updated.interview_confirmed ?? null,
    };
  } catch (err) {
    console.error("scheduleInterview error:", err);
    throw new Error("No se pudo programar la entrevista");
  }
}
