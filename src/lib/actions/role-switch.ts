"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function switchRole() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current active role
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const newRole = profile.active_role === "worker" ? "employer" : "worker";

  // Update active_role
  await supabase
    .from("profiles")
    .update({ active_role: newRole })
    .eq("id", user.id);

  // Determine redirect destination
  if (newRole === "employer") {
    // Check if company exists
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    redirect(company ? "/employer/dashboard" : "/employer/company-profile");
  } else {
    // Check if worker profile is complete
    const { data: workerProfile } = await supabase
      .from("profiles")
      .select("profile_complete")
      .eq("id", user.id)
      .single();

    redirect(workerProfile?.profile_complete ? "/dashboard" : "/profile");
  }
}
