import { getWorkerContracts } from "@/lib/actions/contracts";
import { getWallet, getTransactions } from "@/lib/actions/wallet";
import { WalletClient } from "./wallet-client";

export const metadata = {
  title: "Wallet & Contratos | Syneria",
};

export default async function WalletPage() {
  const [contracts, wallet, transactions] = await Promise.all([
    getWorkerContracts(),
    getWallet(),
    getTransactions(),
  ]);

  return (
    <WalletClient
      initialContracts={contracts}
      walletData={wallet}
      transactionData={transactions}
    />
  );
}
