import type { ReactNode } from "react";
import { BuyerSidebar } from "@/components/buyer/layout/buyer-sidebar";
import { BuyerTopbar } from "@/components/buyer/layout/buyer-topbar";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <BuyerSidebar />
      <div className="min-w-0 flex-1">
        <BuyerTopbar />
        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
