import { AccountSettingsClient } from "@/components/buyer/account/account-settings-client";
import { requireServerSession } from "@/lib/auth/server-session";

export default async function SettingsPage() {
  const session = await requireServerSession();
  return <AccountSettingsClient session={session} />;
}
