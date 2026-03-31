import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/app/(worker)/profile/profile-client";
import { calculateProfileCompleteness } from "@/lib/utils/profile-completeness";

export const metadata = {
  title: "Mi Perfil | Syneria",
};

async function getProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) throw new Error("No profile found");

    return {
      id: user.id,
      full_name: profile.full_name || "Usuario",
      email: user.email ?? "",
      phone: profile.phone ?? "",
      country: profile.country ?? "",
      city: profile.city ?? "",
      bio: profile.bio ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      avatar_url: profile.avatar_url ?? null,
      skills: profile.skills ?? [],
      languages: profile.languages ?? [],
      experience_years: profile.experience_years ?? 0,
      education: profile.education ?? [],
      certifications: profile.certifications ?? [],
      availability: profile.availability ?? "immediate",
      desired_salary: profile.desired_salary ?? 0,
      passport_verified: profile.passport_verified ?? false,
      profile_complete: profile.profile_complete ?? false,
      documents: profile.documents ?? {},
      desired_countries: profile.desired_countries ?? [],
      desired_sectors: profile.desired_sectors ?? [],
    };
  } catch {
    return {
      id: "", full_name: "Usuario", email: "", phone: "", country: "", city: "",
      bio: "", date_of_birth: "", avatar_url: null, skills: [], languages: [],
      experience_years: 0, education: [], certifications: [], availability: "immediate",
      desired_salary: 0, passport_verified: false, profile_complete: false,
      documents: {}, desired_countries: [], desired_sectors: [],
    };
  }
}

export default async function EmployerPersonalProfilePage() {
  const profile = await getProfile();
  const { percentage: completionPercentage } = calculateProfileCompleteness(profile);

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileClient profile={profile} completionPercentage={completionPercentage} />
    </div>
  );
}
