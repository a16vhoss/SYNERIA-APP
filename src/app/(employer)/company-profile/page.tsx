import { MOCK_COMPANY } from "@/lib/constants/mock-data";
import { CompanyProfileClient } from "./company-profile-client";

export const metadata = {
  title: "Perfil de Empresa | Syneria",
  description: "Configura el perfil publico de tu empresa",
};

export default function CompanyProfilePage() {
  // In production this would fetch from Supabase via server action
  const company = MOCK_COMPANY;

  const initialData = {
    name: company.name,
    description: company.description,
    sector: company.sector,
    country: company.country,
    city: company.city,
    website: "",
    employees_count: undefined,
    logo_gradient: "green",
  };

  return <CompanyProfileClient initialData={initialData} />;
}
