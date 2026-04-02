import { getGroupById, getGroupPosts, getGroupMembers } from "@/lib/actions/groups";
import { GroupDetailClient } from "./group-detail-client";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  try {
    const group = await getGroupById(groupId);
    return { title: `${group.name} | Syneria` };
  } catch {
    return { title: "Grupo | Syneria" };
  }
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  try {
    const [group, { posts, nextCursor }, members] = await Promise.all([
      getGroupById(groupId),
      getGroupPosts(groupId),
      getGroupMembers(groupId),
    ]);
    return (
      <GroupDetailClient
        group={group}
        initialPosts={posts}
        initialCursor={nextCursor}
        members={members}
      />
    );
  } catch {
    notFound();
  }
}
