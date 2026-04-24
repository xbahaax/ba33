"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
  Badge,
  Button,
} from "@ba33/ui-web";
import {
  LayoutDashboard,
  BarChart3,
  Search,
  FileText,
  Download,
  ClipboardList,
  LogOut,
  Building2,
  Bell,
} from "lucide-react";
import { getSession, clearSession, getInstitution } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, module: "" },
  { href: "/dashboard/statistics", label: "Statistiques", icon: BarChart3, module: "statistics" },
  { href: "/dashboard/queries", label: "Requêtes", icon: Search, module: "queries" },
  { href: "/dashboard/audit-log", label: "Journal d'audit", icon: ClipboardList, module: "audit-log" },
  { href: "/dashboard/exports", label: "Exports", icon: Download, module: "exports" },
  { href: "/dashboard/filings", label: "Dépôts réglementaires", icon: FileText, module: "filings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push("/login"); return; }
    setSession(s);
  }, [router]);

  const institution = session ? getInstitution(session.institutionId) : null;

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  if (!session || !institution) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs font-mono shrink-0">
            b
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm leading-none">ba33</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">
              {institution.shortName}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {NAV_ITEMS.map((item) => {
              const allowed =
                item.module === "" ||
                institution.allowedModules.includes(item.module);
              if (!allowed) return null;
              return (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  icon={<item.icon className="h-4 w-4" />}
                  active={pathname === item.href}
                >
                  {item.label}
                </SidebarNavItem>
              );
            })}
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 rounded-full bg-primary/20 items-center justify-center shrink-0">
              <Building2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {session.userName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {session.userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background shrink-0">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {institution.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Accès lecture seule · Toutes les requêtes sont journalisées
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {institution.mandate.toUpperCase()}
            </Badge>
            <Link href="/verify" target="_blank">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
