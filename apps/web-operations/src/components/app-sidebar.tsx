"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, cn } from "@ba33/ui-web";
import {
  Activity,
  LayoutDashboard,
  Warehouse,
  WashingMachine,
  Factory,
  ShoppingCart,
  Award,
  Settings,
  Users,
  Truck,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";

const navItems = [
  {
    label: "Command Center",
    href: "/",
    icon: LayoutDashboard,
    permissions: ["dashboard.view"],
  },
  {
    label: "Fulfillment",
    href: "/fulfillment",
    icon: Activity,
    permissions: ["fulfillment.view"],
  },
  {
    label: "Contrôle",
    href: "/analytics",
    icon: ShieldCheck,
    permissions: ["validation.view"],
  },
  {
    label: "Traçabilité",
    href: "/traceability",
    icon: Search,
    permissions: ["traceability.view"],
  },
  { label: "Dépôt", href: "/depot", icon: Warehouse, permissions: ["depot.view"] },
  {
    label: "Laverie",
    href: "/laverie",
    icon: WashingMachine,
    permissions: ["laverie.view"],
  },
  {
    label: "Transformation",
    href: "/transformation",
    icon: Factory,
    permissions: ["transformation.view"],
  },
  {
    label: "Ventes",
    href: "/sales",
    icon: ShoppingCart,
    permissions: ["sales.view"],
  },
  {
    label: "Transport",
    href: "/transport",
    icon: Truck,
    permissions: ["transport.view"],
  },
  {
    label: "Certification",
    href: "/certification",
    icon: Award,
    permissions: ["certification.view"],
  },
  {
    label: "Régions",
    href: "/regions",
    icon: MapPin,
    permissions: ["regions.view"],
  },
  {
    label: "Accès & RBAC",
    href: "/users",
    icon: Users,
    permissions: ["users.view"],
  },
  {
    label: "Règles",
    href: "/settings",
    icon: Settings,
    permissions: ["rules.view"],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, loading, personas, session, switchPersona } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) =>
        item.permissions.every((permission) => hasPermission(permission)),
      ),
    [hasPermission],
  );

  const currentLabel = useMemo(
    () =>
      visibleNavItems.find((item) =>
        item.href === "/"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      )?.label ?? (session ? "Accès limité" : "ba33 Opérations"),
    [pathname, visibleNavItems],
  );

  const currentRouteIsAccessible = useMemo(
    () =>
      visibleNavItems.some((item) =>
        item.href === "/"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ),
    [pathname, visibleNavItems],
  );

  const fallbackHref = visibleNavItems[0]?.href ?? null;

  const accessNotice =
    session && visibleNavItems.length > 0 && !currentRouteIsAccessible ? (
      <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-3 text-amber-950 shadow-sm">
        <p className="text-sm font-semibold">Accès limité pour ce profil</p>
        <p className="mt-1 text-xs text-amber-900/80">
          Cette page n'est pas autorisée. Les liens ci-dessous restent visibles
          pour montrer ce que ce profil peut ouvrir.
        </p>
        {fallbackHref ? (
          <Button
            className="mt-3 w-full"
            size="sm"
            variant="outline"
            onClick={() => router.push(fallbackHref)}
          >
            Aller à {visibleNavItems[0]?.label}
          </Button>
        ) : null}
      </div>
    ) : null;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex flex-col gap-1">
      {visibleNavItems.map((item) => {
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

  const personaPicker = (
    <div className="space-y-2 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/20 p-3">
      <div>
        <p className="text-sm font-semibold">
          {session?.user.fullName ?? "Session indisponible"}
        </p>
        <p className="text-xs text-muted-foreground">
          {session?.user.userType ?? "Aucun profil"} ·{" "}
          {session?.user.regionName ?? "Toutes régions"}
        </p>
      </div>

      <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Persona dev
      </label>
      <select
        className="w-full rounded-xl border border-sidebar-border bg-sidebar px-3 py-2 text-sm text-sidebar-foreground outline-none"
        disabled={loading}
        value={session?.user.id ?? ""}
        onChange={async (event) => {
          const persona = personas.find(
            (candidate) => candidate.id === event.target.value,
          );

          if (!persona) {
            return;
          }

          const nextSession = await switchPersona({
            email: persona.email,
          });

          if (!nextSession) {
            return;
          }

          const nextNavItems = navItems.filter((item) =>
            item.permissions.every((permission) =>
              nextSession.permissions.includes(permission),
            ),
          );

          const canStayOnCurrentRoute = nextNavItems.some((item) =>
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`),
          );

          if (canStayOnCurrentRoute) {
            router.refresh();
            return;
          }

          router.push(nextNavItems[0]?.href ?? "/");
        }}
      >
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.fullName} · {persona.userType}
          </option>
        ))}
      </select>
    </div>
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

            <div className="mt-4 space-y-4">
              {accessNotice}
              {nav}
              {personaPicker}
            </div>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {accessNotice}
          {nav}
        </div>
        <div className="space-y-4 border-t border-sidebar-border px-5 py-4">
          {personaPicker}
          <p className="text-xs text-muted-foreground">
            ba33 operations console
          </p>
        </div>
      </aside>
    </>
  );
}
