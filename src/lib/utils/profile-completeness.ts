/* ------------------------------------------------------------------ */
/*  Profile Completeness Calculator                                    */
/* ------------------------------------------------------------------ */

export interface ProfileData {
  full_name?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  date_of_birth?: string | null;
  skills?: string[];
  languages?: string[];
  experience_years?: number | null;
  education?: { id: string }[];
  certifications?: { id: string }[];
  documents?: {
    passport?: boolean;
    cv?: boolean;
  };
}

interface CompletionItem {
  key: string;
  label: string;
  weight: number;
  filled: boolean;
}

export function calculateProfileCompleteness(profile: ProfileData): {
  percentage: number;
  items: CompletionItem[];
} {
  const items: CompletionItem[] = [
    {
      key: "full_name",
      label: "Nombre completo",
      weight: 10,
      filled: !!profile.full_name?.trim(),
    },
    {
      key: "phone",
      label: "Telefono",
      weight: 5,
      filled: !!profile.phone?.trim(),
    },
    {
      key: "country",
      label: "Pais",
      weight: 5,
      filled: !!profile.country?.trim(),
    },
    {
      key: "city",
      label: "Ciudad",
      weight: 5,
      filled: !!profile.city?.trim(),
    },
    {
      key: "bio",
      label: "Bio / Descripcion",
      weight: 10,
      filled: !!profile.bio?.trim(),
    },
    {
      key: "date_of_birth",
      label: "Fecha de nacimiento",
      weight: 5,
      filled: !!profile.date_of_birth,
    },
    {
      key: "skills",
      label: "Habilidades (al menos 1)",
      weight: 10,
      filled: (profile.skills?.length ?? 0) >= 1,
    },
    {
      key: "languages",
      label: "Idiomas (al menos 1)",
      weight: 10,
      filled: (profile.languages?.length ?? 0) >= 1,
    },
    {
      key: "experience_years",
      label: "Anos de experiencia",
      weight: 5,
      filled: profile.experience_years != null && profile.experience_years > 0,
    },
    {
      key: "education",
      label: "Educacion (al menos 1)",
      weight: 10,
      filled: (profile.education?.length ?? 0) >= 1,
    },
    {
      key: "certifications",
      label: "Certificaciones (al menos 1)",
      weight: 5,
      filled: (profile.certifications?.length ?? 0) >= 1,
    },
    {
      key: "documents_passport",
      label: "Pasaporte",
      weight: 10,
      filled: !!profile.documents?.passport,
    },
    {
      key: "documents_cv",
      label: "Curriculum / CV",
      weight: 10,
      filled: !!profile.documents?.cv,
    },
  ];

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const filledWeight = items
    .filter((i) => i.filled)
    .reduce((sum, i) => sum + i.weight, 0);
  const percentage = Math.round((filledWeight / totalWeight) * 100);

  return { percentage, items };
}
