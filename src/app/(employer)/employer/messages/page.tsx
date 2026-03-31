import { createClient } from "@/lib/supabase/server";
import { EmployerMessagesClient } from "./messages-client";

export default async function EmployerMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <EmployerMessagesClient currentUserId={user?.id} />;
}
