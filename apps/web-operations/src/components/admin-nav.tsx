"use client";

import { cn } from "@ba33/ui-web";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminTabs = [
  { label: "Command Center", href: "/admin" },
  { label: "Fulfillment", href: "/admin/fulfillment" },
  { label: "Controle", href: "/admin/analytics" },
  { label: "Tracabilite", href: "/admin/traceability" },
  { label: "Transport", href: "/admin/transport" },
  { label: "Certification", href: "/admin/certification" },
  { label: "Regions", href: "/admin/regions" },
  { label: "Acces & RBAC", href: "/admin/users" },
  { label: "Regles", href: "/admin/settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto py-2">
      {adminTabs.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
