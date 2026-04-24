"use client";

import { AdminNav } from "@/components/admin-nav";
import { WorkstationHeader } from "@/components/workstation-header";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <WorkstationHeader nav={<AdminNav />} />
      <main className="min-w-0">{children}</main>
    </>
  );
}
