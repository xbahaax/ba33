"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FileText,
  LogOut,
  MapPin,
  Moon,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sun,
  User,
  MessageSquareWarning,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@ba33/ui-web/cn";
import { useCartEntries } from "@/lib/cart-store";

const navigationGroups = [
  {
    label: "Achats",
    items: [
      { href: "/catalog", label: "Catalogue", icon: Package },
      { href: "/cart", label: "Mon Panier", icon: ShoppingCart, badge: "2" },
      { href: "/orders", label: "Mes Commandes", icon: ClipboardCheck },
    ],
  },
  {
    label: "Documents",
    items: [
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/verify", label: "Vérifier un certificat", icon: ShieldCheck },
      { href: "/complaints", label: "Réclamations", icon: MessageSquareWarning },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/account", label: "Mon Profil", icon: User },
      { href: "/account/addresses", label: "Adresses", icon: MapPin },
      { href: "/account/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export function BuyerSidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const cartEntries = useCartEntries();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ba33-theme");
    const darkEnabled = savedTheme === "dark" || document.documentElement.classList.contains("dark");

    setIsDark(darkEnabled);
    document.documentElement.classList.toggle("dark", darkEnabled);
  }, []);

  const toggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("ba33-theme", nextDark ? "dark" : "light");
  };

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      {/* ─── Logo ─── */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="font-serif text-sm font-bold text-primary-foreground">b</span>
        </div>
        <div>
          <p className="font-serif text-xl leading-none text-sidebar-foreground">ba33</p>
          <p className="font-mono text-[10px] text-muted-foreground">Portail Acheteur</p>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-5">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const badgeValue = item.href === "/cart" && cartEntries.length > 0 ? String(cartEntries.length) : item.badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-xs"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] transition-transform duration-150",
                            isActive ? "scale-110" : "group-hover:scale-105"
                          )}
                        />
                        <span>{item.label}</span>
                      </span>
                      {badgeValue ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-mono text-xs font-bold",
                            isActive
                              ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                              : "bg-primary/15 text-primary"
                          )}
                        >
                          {badgeValue}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── User section ─── */}
      <div className="border-t border-sidebar-border p-3">
        {/* User card */}
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5 text-sidebar-accent-foreground">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
              NF
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar-accent bg-chart-1" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Noura Fibres</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">contact@nourafibres.dz</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isDark ? "Mode clair" : "Mode sombre"}
            onClick={toggleDark}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Clair" : "Sombre"}
          </button>

          <Link
            href="/login"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </Link>
        </div>
      </div>
    </aside>
  );
}
