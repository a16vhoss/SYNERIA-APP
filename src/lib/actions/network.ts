"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  NetworkConnection,
  NetworkSuggestion,
  NetworkRequest,
  SkillEndorsement,
  NetworkActivity,
} from "@/lib/constants/mock-data";

/* ------------------------------------------------------------------ */
/*  Connections                                                        */
/* ------------------------------------------------------------------ */

export async function getConnections(): Promise<NetworkConnection[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: connections } = await supabase
      .from("connections")
      .select(`
        id,
        requester_id,
        addressee_id,
        connection_type,
        status,
        connected_at,
        created_at
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    if (!connections?.length) return [];

    const otherUserIds = connections.map((c) =>
      c.requester_id === user.id ? c.addressee_id : c.requester_id
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role, country, city, avatar_url, skills")
      .in("id", otherUserIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    return connections.map((c, i) => {
      const otherId = c.requester_id === user.id ? c.addressee_id : c.requester_id;
      const profile = profileMap.get(otherId);
      const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;
      return {
        id: c.id,
        name: profile?.full_name ?? "Usuario",
        role: (profile?.role === "employer" ? "employer" : "worker") as "worker" | "employer",
        company: "",
        sector: "",
        country: profile?.country ?? "",
        city: profile?.city ?? "",
        avatarUrl: profile?.avatar_url ?? undefined,
        avatarLetter: (profile?.full_name ?? "U").charAt(0),
        avatarGradient: gradients[i % gradients.length],
        mutualConnections: 0,
        connectedSince: c.connected_at ?? c.created_at,
        skills: (profile?.skills as string[]) ?? [],
      };
    });
  } catch {
    return [];
  }
}

export async function removeConnection(
  connectionId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);
    return { success: !error };
  } catch {
    return { success: false };
  }
}

/* ------------------------------------------------------------------ */
/*  Suggestions                                                        */
/* ------------------------------------------------------------------ */

export async function getSuggestions(): Promise<NetworkSuggestion[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get users not already connected
    const { data: existingConnections } = await supabase
      .from("connections")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    const connectedIds = new Set<string>();
    connectedIds.add(user.id);
    existingConnections?.forEach((c) => {
      connectedIds.add(c.requester_id);
      connectedIds.add(c.addressee_id);
    });

    const { data: suggestions } = await supabase
      .from("profiles")
      .select("id, full_name, role, country, city, avatar_url, skills")
      .not("id", "in", `(${Array.from(connectedIds).join(",")})`)
      .limit(10);

    if (!suggestions?.length) return [];

    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;
    return suggestions.map((p, i) => ({
      id: p.id,
      name: p.full_name ?? "Usuario",
      country: p.country ?? "",
      city: p.city ?? "",
      avatarLetter: (p.full_name ?? "U").charAt(0),
      avatarGradient: gradients[i % gradients.length],
      skills: (p.skills as string[]) ?? [],
      reason: "same_sector" as const,
      reasonDetail: "Sugerencia basada en tu perfil",
      mutualConnections: 0,
    }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Requests                                                           */
/* ------------------------------------------------------------------ */

export async function getRequests(): Promise<NetworkRequest[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: requests } = await supabase
      .from("connections")
      .select("id, requester_id, message, created_at")
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    if (!requests?.length) return [];

    const requesterIds = requests.map((r) => r.requester_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role, country, city")
      .in("id", requesterIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;

    return requests.map((r, i) => {
      const profile = profileMap.get(r.requester_id);
      return {
        id: r.id,
        name: profile?.full_name ?? "Usuario",
        avatarLetter: (profile?.full_name ?? "U").charAt(0),
        avatarGradient: gradients[i % gradients.length],
        message: r.message ?? "Me gustaria conectar contigo",
        direction: "incoming" as const,
        sentAt: r.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function sendConnectionRequest(
  targetUserId: string,
  message?: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from("connections")
      .insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        connection_type: "manual_connection",
        status: "pending",
        message: message ?? null,
      });

    return { success: !error };
  } catch {
    return { success: false };
  }
}

export async function respondToRequest(
  requestId: string,
  action: "accept" | "reject"
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("connections")
      .update({
        status: action === "accept" ? "accepted" : "rejected",
        connected_at: action === "accept" ? new Date().toISOString() : null,
      })
      .eq("id", requestId);

    return { success: !error };
  } catch {
    return { success: false };
  }
}

/* ------------------------------------------------------------------ */
/*  Endorsements                                                       */
/* ------------------------------------------------------------------ */

export async function getEndorsements(): Promise<SkillEndorsement[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: endorsements } = await supabase
      .from("endorsements")
      .select("id, endorser_id, skill, created_at")
      .eq("endorsed_id", user.id);

    if (!endorsements?.length) return [];

    // Group by skill
    const skillMap = new Map<string, { count: number; endorserIds: string[] }>();
    endorsements.forEach((e) => {
      const existing = skillMap.get(e.skill) ?? { count: 0, endorserIds: [] };
      existing.count++;
      existing.endorserIds.push(e.endorser_id);
      skillMap.set(e.skill, existing);
    });

    const allEndorserIds = [...new Set(endorsements.map((e) => e.endorser_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", allEndorserIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;

    return Array.from(skillMap.entries()).map(([skill, data]) => ({
      skillName: skill,
      count: data.count,
      endorsers: data.endorserIds.slice(0, 3).map((id, j) => ({
        name: profileMap.get(id)?.full_name ?? "Usuario",
        avatarLetter: (profileMap.get(id)?.full_name ?? "U").charAt(0),
        avatarGradient: gradients[j % gradients.length],
      })),
    }));
  } catch {
    return [];
  }
}

export async function endorseSkill(
  userId: string,
  skillName: string
): Promise<{ success: boolean; newCount: number }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, newCount: 0 };

    // Need a connection_id to endorse
    const { data: connection } = await supabase
      .from("connections")
      .select("id")
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
      .eq("status", "accepted")
      .limit(1)
      .single();

    if (!connection) return { success: false, newCount: 0 };

    const { error } = await supabase
      .from("endorsements")
      .upsert({
        endorser_id: user.id,
        endorsed_id: userId,
        skill: skillName,
        connection_id: connection.id,
      }, { onConflict: "endorser_id,endorsed_id,skill" });

    if (error) return { success: false, newCount: 0 };

    const { count } = await supabase
      .from("endorsements")
      .select("*", { count: "exact", head: true })
      .eq("endorsed_id", userId)
      .eq("skill", skillName);

    return { success: true, newCount: count ?? 1 };
  } catch {
    return { success: false, newCount: 0 };
  }
}

/* ------------------------------------------------------------------ */
/*  Activity Feed                                                      */
/* ------------------------------------------------------------------ */

export async function getNetworkActivity(): Promise<NetworkActivity[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: activities } = await supabase
      .from("network_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!activities?.length) return [];

    const actorIds = [...new Set(activities.map((a) => a.actor_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
    const gradients = ["green", "orange", "purple", "blue", "red", "teal"] as const;

    return activities.map((a, i) => ({
      id: a.id,
      actorName: profileMap.get(a.actor_id)?.full_name ?? "Usuario",
      actorLetter: (profileMap.get(a.actor_id)?.full_name ?? "U").charAt(0),
      actorGradient: gradients[i % gradients.length],
      type: (a.activity_type ?? "new_connection") as NetworkActivity["type"],
      text: (a.summary_data as Record<string, string>)?.detail ?? "",
      time: getTimeAgo(a.created_at),
    }));
  } catch {
    return [];
  }
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Hace unos minutos";
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PublicProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  skills: string[];
  languages: any[];
  experience_years: number;
  education: any[];
  certifications: string[];
  availability: string;
  desired_salary: number | null;
  passport_verified: boolean;
  profile_complete: boolean;
  rating: number | null;
  jobs_completed: number;
  desired_countries: string[];
  desired_sectors: string[];
  created_at: string;
}

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Profile not found");
  return data;
}

export async function getConnectionStatus(userId: string): Promise<{
  status: "none" | "pending_sent" | "pending_received" | "accepted" | "blocked";
  connectionId: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "none", connectionId: null };

  const { data } = await supabase
    .from("connections")
    .select("id, status, requester_id")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`
    )
    .single();

  if (!data) return { status: "none", connectionId: null };

  if (data.status === "accepted") return { status: "accepted", connectionId: data.id };
  if (data.status === "blocked") return { status: "blocked", connectionId: data.id };
  if (data.requester_id === user.id) return { status: "pending_sent", connectionId: data.id };
  return { status: "pending_received", connectionId: data.id };
}
