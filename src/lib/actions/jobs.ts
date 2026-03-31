"use server";

import type { MockVacancy } from "@/lib/constants/mock-data";
import { MOCK_VACANCIES } from "@/lib/constants/mock-data";

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

// ── In-memory store (mock) ───────────────────────────────────────────
let _store: MockVacancy[] = [...MOCK_VACANCIES];

// ── CRUD helpers ─────────────────────────────────────────────────────

export async function getEmployerJobs(
  _employerId?: string
): Promise<MockVacancy[]> {
  // In production: fetch from Supabase filtered by employer
  return _store;
}

export async function getJobById(
  id: string
): Promise<MockVacancy | undefined> {
  return _store.find((v) => v.id === id);
}

export async function createJob(
  data: CreateJobInput
): Promise<MockVacancy> {
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

  _store = [newVacancy, ..._store];
  return newVacancy;
}

export async function updateJob(
  id: string,
  data: UpdateJobInput
): Promise<MockVacancy> {
  _store = _store.map((v) => {
    if (v.id !== id) return v;
    return {
      ...v,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.sector !== undefined && { sector: data.sector }),
      ...(data.contract_type !== undefined && {
        contract_type: data.contract_type,
      }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.city !== undefined && {
        city: data.city,
        location: `${data.city}, ${v.country}`,
      }),
      ...(data.salary_min !== undefined && {
        salary_min: data.salary_min ? Number(data.salary_min) : null,
      }),
      ...(data.salary_max !== undefined && {
        salary_max: data.salary_max ? Number(data.salary_max) : null,
      }),
    };
  });

  const updated = _store.find((v) => v.id === id);
  if (!updated) throw new Error("Vacancy not found");
  return updated;
}

export async function updateJobStatus(
  id: string,
  status: VacancyStatus
): Promise<MockVacancy> {
  _store = _store.map((v) => (v.id === id ? { ...v, status } : v));

  const updated = _store.find((v) => v.id === id);
  if (!updated) throw new Error("Vacancy not found");
  return updated;
}

export async function deleteJob(id: string): Promise<void> {
  _store = _store.filter((v) => v.id !== id);
}
