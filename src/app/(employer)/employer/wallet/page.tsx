import { EmployerWalletClient } from "./employer-wallet-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: `${t("nav.wallet")} | Syneria` };
}

export default function EmployerWalletPage() {
  return <EmployerWalletClient />;
}
