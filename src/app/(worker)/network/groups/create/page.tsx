import { CreateGroupClient } from "./create-group-client";

export async function generateMetadata() {
  return { title: "Crear Grupo | Syneria" };
}

export default function CreateGroupPage() {
  return <CreateGroupClient />;
}
