import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_role, profile_complete")
          .eq("id", user.id)
          .single();

        if (profile) {
          let redirect: string;

          if (profile.active_role === "employer") {
            redirect = profile.profile_complete
              ? "/employer/dashboard"
              : "/employer/company-profile";
          } else {
            redirect = profile.profile_complete
              ? "/dashboard"
              : "/profile";
          }

          return NextResponse.redirect(new URL(redirect, origin));
        }

        // Profile exists but no role - send to role selection
        return NextResponse.redirect(new URL(next, origin));
      }
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
