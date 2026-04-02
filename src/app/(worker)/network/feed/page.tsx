import { getFeedItems } from "@/lib/actions/feed";
import { FeedClient } from "./feed-client";

export default async function FeedPage() {
  const { items, nextCursor } = await getFeedItems({ type: "all" });
  return <FeedClient initialItems={items} initialCursor={nextCursor} />;
}
