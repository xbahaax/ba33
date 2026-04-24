"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, ShoppingCart, ClipboardCheck, FileText, ShieldCheck, User, MapPin, Settings, MessageSquareWarning } from "lucide-react";
import { useState } from "react";
import { cn } from "@ba33/ui-web/cn";

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

export function BuyerMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[300px] bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-serif text-sm font-bold text-primary-foreground">b</span>
          </div>
          <div>
            <p className="font-serif text-xl leading-none text-sidebar-foreground">ba33</p>
            <p className="font-mono text-[10px] text-muted-foreground">Portail Acheteur</p>
          </div>
        </div>

        {/* Nav groups */}
        <div className="overflow-y-auto px-3 py-5">
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
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-[18px] w-[18px]" />
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
