import { NetworkClient } from "./network-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return { title: `${t("nav.network")} | Syneria` };
}

export default function NetworkPage() {
  return <NetworkClient />;
}
