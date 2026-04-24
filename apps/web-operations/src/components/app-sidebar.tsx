"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, cn } from "@ba33/ui-web";
import {
  LayoutDashboard,
  Warehouse,
  WashingMachine,
  Factory,
  ShoppingCart,
  Award,
  BarChart3,
  Settings,
  Users,
  Truck,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { label: "Dépôt", href: "/depot", icon: Warehouse },
  { label: "Laverie", href: "/laverie", icon: WashingMachine },
  { label: "Transformation", href: "/transformation", icon: Factory },
  { label: "Ventes", href: "/sales", icon: ShoppingCart },
  { label: "Transport", href: "/transport", icon: Truck },
  { label: "Certification", href: "/certification", icon: Award },
  { label: "Régions", href: "/regions", icon: MapPin },
  { label: "Statistiques", href: "/analytics", icon: BarChart3 },
  { label: "Utilisateurs", href: "/users", icon: Users },
  { label: "Paramètres", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel = useMemo(
    () =>
      navItems.find((item) =>
        item.href === "/"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      )?.label ?? "ba33 Opérations",
    [pathname],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <item.icon className="h-4 w-4" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border/80 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              b
            </div>
            <div>
              <p className="text-sm font-semibold">ba33 Opérations</p>
              <p className="text-xs text-muted-foreground">{currentLabel}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Ouvrir la navigation"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden">
          <div className="h-full w-[86vw] max-w-xs border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-sidebar-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  b
                </div>
                <div>
                  <p className="text-sm font-semibold">ba33</p>
                  <p className="text-xs text-muted-foreground">Opérations</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer la navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">{nav}</div>
          </div>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            b
          </div>
          <div>
            <p className="text-sm font-semibold">ba33</p>
            <p className="text-xs text-muted-foreground">Opérations</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{nav}</div>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-xs text-muted-foreground">ba33 operations console</p>
        </div>
      </aside>
    </>
  );
}
