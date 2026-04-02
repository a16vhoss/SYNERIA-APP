import { getGroups } from "@/lib/actions/groups";
import { GroupsClient } from "./groups-client";

export async function generateMetadata() {
  return { title: "Grupos | Syneria" };
}

export default async function GroupsPage() {
  const groups = await getGroups();
  return <GroupsClient initialGroups={groups} />;
}
