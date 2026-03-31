import { createClient } from "@/lib/supabase/server";
import { WorkerMessagesClient } from "./messages-client";

export default async function WorkerMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <WorkerMessagesClient currentUserId={user?.id} />;
}
