import { getEmployerContracts } from "@/lib/actions/contracts";
import { ContractsClient } from "./contracts-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: `${t("nav.contracts")} | Syneria` };
}

export default async function EmployerContractsPage() {
  const contracts = await getEmployerContracts();

  return <ContractsClient initialContracts={contracts} />;
}
