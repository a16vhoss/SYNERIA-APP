import { ProfileClient } from "./profile-client";
import { calculateProfileCompleteness, type ProfileData } from "@/lib/utils/profile-completeness";

const mockProfile = {
  id: "mock-uuid",
  full_name: "Ana Socia",
  email: "ana.socia@email.com",
  phone: "+51 999 888 777",
  country: "PE",
  city: "Bogota",
  bio: "Profesional con experiencia en construccion y proyectos internacionales.",
  date_of_birth: "1990-05-15",
  avatar_url: null,
  skills: ["Electricidad", "Soldadura", "Construccion"],
  languages: ["Espanol", "Ingles"],
  experience_years: 5,
  education: [],
  certifications: [{ id: "1" }],
  availability: "immediate",
  desired_salary: 3200,
  passport_verified: false,
  profile_complete: false,
  documents: {},
  desired_countries: ["ES", "DE"],
  desired_sectors: ["Construccion"],
};

export default function ProfilePage() {
  const profile = mockProfile;
  const { percentage: completionPercentage } = calculateProfileCompleteness(profile);

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileClient profile={profile} completionPercentage={completionPercentage} />
    </div>
  );
}
