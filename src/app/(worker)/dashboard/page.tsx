import { createClient } from "@/lib/supabase/server";
import {
  MOCK_PROFILE,
  MOCK_STATS,
  MOCK_JOBS,
  MOCK_UPCOMING_INTERVIEW,
} from "@/lib/constants/mock-data";
import { WorkerDashboardClient } from "./client";

/* ------------------------------------------------------------------ */
/*  Server-side data fetching (falls back to mock data)                */
/* ------------------------------------------------------------------ */

async function getDashboardData() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("No authenticated user");

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch active jobs count
    const { count: jobsCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Fetch user's applications count
    const { count: applicationsCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Fetch unread notifications count
    const { count: notificationsCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    // Fetch recommended jobs (matching desired_sectors or fallback to recent)
    let recommendedJobs: Record<string, unknown>[] | null = null;
    if (profile?.desired_sectors?.length) {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .overlaps("sectors", profile.desired_sectors)
        .limit(3);
      recommendedJobs = data;
    }
    if (!recommendedJobs?.length) {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);
      recommendedJobs = data;
    }

    // Fetch upcoming interview (within 48 hours)
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const { data: interviews } = await supabase
      .from("interviews")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in48h.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1);

    // Map DB jobs to JobData shape
    const mappedJobs = (recommendedJobs ?? []).map((j: Record<string, unknown>, i: number) => ({
      id: String(j.id),
      companyName: String(j.company_name ?? "Empresa"),
      companyLetter: String(j.company_name ?? "E").charAt(0),
      companyGradient: (["green", "orange", "purple", "blue", "teal"] as const)[
        i % 5
      ],
      title: String(j.title),
      location: String(j.location ?? ""),
      salary: String(j.salary ?? ""),
      tags: Array.isArray(j.tags) ? j.tags : [],
    }));

    return {
      firstName: profile?.first_name ?? "Usuario",
      stats: {
        availableJobs: jobsCount ?? 0,
        myApplications: applicationsCount ?? 0,
        notifications: notificationsCount ?? 0,
        profileCompletion: profile?.profile_completion ?? 0,
      },
      jobs: mappedJobs,
      interview: interviews?.[0]
        ? {
            id: String(interviews[0].id),
            companyName: String(interviews[0].company_name),
            jobTitle: String(interviews[0].job_title),
            date: String(interviews[0].date),
            time: String(interviews[0].time),
          }
        : null,
    };
  } catch {
    // Supabase not configured or no auth – return mock data
    return {
      firstName: MOCK_PROFILE.firstName,
      stats: MOCK_STATS,
      jobs: MOCK_JOBS.slice(0, 3),
      interview: {
        id: MOCK_UPCOMING_INTERVIEW.id,
        companyName: MOCK_UPCOMING_INTERVIEW.companyName,
        jobTitle: MOCK_UPCOMING_INTERVIEW.jobTitle,
        date: MOCK_UPCOMING_INTERVIEW.date,
        time: MOCK_UPCOMING_INTERVIEW.time,
      },
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default async function WorkerDashboardPage() {
  const data = await getDashboardData();

  return <WorkerDashboardClient data={data} />;
}
