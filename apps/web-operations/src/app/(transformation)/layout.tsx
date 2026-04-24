"use client";

import { WorkstationHeader } from "@/components/workstation-header";

export default function TransformationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <WorkstationHeader />
      <main className="min-w-0">{children}</main>
    </>
  );
}
