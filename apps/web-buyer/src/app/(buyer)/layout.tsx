import type { ReactNode } from "react";
import { BuyerSidebar } from "@/components/buyer/layout/buyer-sidebar";
import { BuyerTopbar } from "@/components/buyer/layout/buyer-topbar";
import { requireServerSession } from "@/lib/auth/server-session";

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const session = await requireServerSession();

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <BuyerSidebar session={session} />
      <div className="min-w-0 flex-1">
        <BuyerTopbar session={session} />
        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
