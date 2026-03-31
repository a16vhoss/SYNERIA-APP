"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("full_name, role, avatar_url")
          .eq("id", user.id)
          .single();

        if (data) {
          const parts = (data.full_name ?? "Usuario").split(" ");
          setProfile({
            firstName: parts[0] ?? "Usuario",
            lastName: parts.slice(1).join(" ") ?? "",
            role: data.role ?? "worker",
            avatarUrl: data.avatar_url ?? null,
          });
        } else {
          // Fallback: use auth metadata
          const meta = user.user_metadata;
          const fullName = meta?.full_name ?? user.email?.split("@")[0] ?? "Usuario";
          const parts = fullName.split(" ");
          setProfile({
            firstName: parts[0] ?? "Usuario",
            lastName: parts.slice(1).join(" ") ?? "",
            role: meta?.role ?? "worker",
            avatarUrl: meta?.avatar_url ?? null,
          });
        }
      } catch {
        // Silent fail - will show defaults
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const displayName = profile
    ? `${profile.firstName}${profile.lastName ? " " + profile.lastName : ""}`
    : "Usuario";

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : "U";

  const roleLabel =
    profile?.role === "employer" ? "Empresa" : "Worker";

  return {
    profile,
    loading,
    displayName,
    initials,
    roleLabel,
    avatarUrl: profile?.avatarUrl ?? null,
  };
}
