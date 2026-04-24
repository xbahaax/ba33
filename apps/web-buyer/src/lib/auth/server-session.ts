import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, getMe, type SessionUser } from "@/lib/api/buyer-api";

export async function getServerAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function requireServerAuthToken(): Promise<string> {
  const token = await getServerAuthToken();

  if (!token) {
    redirect("/login");
  }

  return token;
}

export async function getServerSession(): Promise<SessionUser | null> {
  const token = await getServerAuthToken();

  if (!token) {
    return null;
  }

  try {
    return await getMe(token);
  } catch {
    return null;
  }
}

export async function requireServerSession(): Promise<SessionUser> {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
