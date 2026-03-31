import { getWorkerContracts } from "@/lib/actions/contracts";
import { WalletClient } from "./wallet-client";

export const metadata = {
  title: "Wallet & Contratos | Syneria",
};

export default async function WalletPage() {
  const contracts = await getWorkerContracts();

  return <WalletClient initialContracts={contracts} />;
}
