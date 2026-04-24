import { redirect } from "next/navigation";
import { getServerAuthToken } from "@/lib/auth/server-session";

export default async function HomePage() {
  const token = await getServerAuthToken();
  redirect(token ? "/catalog" : "/login");
}
