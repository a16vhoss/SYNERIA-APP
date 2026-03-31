"use server";

import type {
  MockApplication,
  MockCandidate,
} from "@/lib/constants/mock-data";
import {
  MOCK_APPLICATIONS,
  MOCK_CANDIDATES,
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
  jobTitle: string;
  companyName: string;
  coverLetter?: string;
  motivation?: string;
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

// ── In-memory stores (mock) ─────────────────────────────────────────

let _applications: MockApplication[] = [...MOCK_APPLICATIONS];
let _candidates: MockCandidate[] = [...MOCK_CANDIDATES];
let _interviews: InterviewData[] = [
  {
    applicationId: "app_002",
    date: "2026-04-01",
    time: "10:00",
    videoLink: "https://meet.google.com/abc-defg-hij",
    notes: "Por favor tener disponible tu CV y documentos de identidad.",
    confirmed: null,
  },
];

// ── Worker Actions ──────────────────────────────────────────────────

export async function createApplication(
  data: CreateApplicationInput
): Promise<MockApplication> {
  const newApp: MockApplication = {
    id: `app_${Date.now()}`,
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    companyName: data.companyName,
    status: "pending",
    appliedAt: new Date().toISOString().split("T")[0],
  };
  _applications = [newApp, ..._applications];
  return newApp;
}

export async function getWorkerApplications(
  _userId?: string
): Promise<MockApplication[]> {
  return _applications;
}

export async function getApplicationInterviews(
  _userId?: string
): Promise<InterviewData[]> {
  return _interviews;
}

export async function respondToInterview(
  applicationId: string,
  confirmed: boolean
): Promise<InterviewData> {
  _interviews = _interviews.map((i) =>
    i.applicationId === applicationId ? { ...i, confirmed } : i
  );
  const updated = _interviews.find((i) => i.applicationId === applicationId);
  if (!updated) throw new Error("Interview not found");
  return updated;
}

// ── Employer Actions ────────────────────────────────────────────────

export async function getJobApplications(
  _jobId?: string
): Promise<MockCandidate[]> {
  if (_jobId) {
    return _candidates.filter((c) => c.vacancy_id === _jobId);
  }
  return _candidates;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<MockCandidate> {
  _candidates = _candidates.map((c) =>
    c.id === id ? { ...c, status } : c
  );
  const updated = _candidates.find((c) => c.id === id);
  if (!updated) throw new Error("Candidate not found");
  return updated;
}

export async function scheduleInterview(
  applicationId: string,
  date: string,
  time: string,
  videoLink: string,
  notes?: string
): Promise<InterviewData> {
  // Update candidate status to interview
  _candidates = _candidates.map((c) =>
    c.id === applicationId ? { ...c, status: "interview" as const } : c
  );

  const interview: InterviewData = {
    applicationId,
    date,
    time,
    videoLink,
    notes,
    confirmed: null,
  };

  _interviews = [..._interviews, interview];
  return interview;
}
