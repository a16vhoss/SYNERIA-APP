import { getEmployerContracts } from "@/lib/actions/contracts";
import { ContractsClient } from "./contracts-client";

export const metadata = {
  title: "Contratos | Syneria Employer",
};

export default async function EmployerContractsPage() {
  const contracts = await getEmployerContracts();

  return <ContractsClient initialContracts={contracts} />;
}
