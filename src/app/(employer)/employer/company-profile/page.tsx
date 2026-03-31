import { createClient } from "@/lib/supabase/server";
import { CompanyProfileClient } from "./company-profile-client";

export const metadata = {
  title: "Perfil de Empresa | Syneria",
  description: "Configura el perfil publico de tu empresa",
};

async function getCompanyData() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No auth");

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (!company) throw new Error("No company");

    return {
      name: company.name ?? "",
      description: company.description ?? "",
      sector: company.sector ?? "",
      country: company.country ?? "",
      city: company.city ?? "",
      website: company.website ?? "",
      employees_count: company.employees_count ?? undefined,
      logo_gradient: company.logo_gradient ?? "green",
    };
  } catch {
    return {
      name: "",
      description: "",
      sector: "",
      country: "",
      city: "",
      website: "",
      employees_count: undefined,
      logo_gradient: "green",
    };
  }
}

export default async function CompanyProfilePage() {
  const initialData = await getCompanyData();

  return <CompanyProfileClient initialData={initialData} />;
}
