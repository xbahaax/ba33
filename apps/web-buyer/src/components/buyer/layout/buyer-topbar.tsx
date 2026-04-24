"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { BuyerMobileNav } from "@/components/buyer/layout/buyer-mobile-nav";
import { LanguageSwitcher } from "@/components/buyer/shared/language-switcher";
import { NotificationPanel } from "@/components/buyer/layout/notification-panel";
import { UserMenu } from "@/components/buyer/layout/user-menu";
import { cn } from "@ba33/ui-web/cn";
import type { SessionUser } from "@/lib/api/buyer-api";

type BreadcrumbSegment = { label: string; href?: string };

const breadcrumbMap: Array<{ match: RegExp; segments: BreadcrumbSegment[] }> = [
  { match: /^\/catalog\//, segments: [{ label: "Catalogue", href: "/catalog" }, { label: "Détail produit" }] },
  { match: /^\/catalog$/, segments: [{ label: "Catalogue" }] },
  { match: /^\/verify$/, segments: [{ label: "Vérifier un certificat" }] },
  { match: /^\/cart$/, segments: [{ label: "Mon Panier" }] },
  { match: /^\/checkout$/, segments: [{ label: "Mon Panier", href: "/cart" }, { label: "Checkout" }] },
  { match: /^\/orders\//, segments: [{ label: "Mes Commandes", href: "/orders" }, { label: "Détail commande" }] },
  { match: /^\/orders$/, segments: [{ label: "Mes Commandes" }] },
  { match: /^\/documents$/, segments: [{ label: "Documents" }] },
  { match: /^\/complaints\/new$/, segments: [{ label: "Réclamations", href: "/complaints" }, { label: "Nouvelle réclamation" }] },
  { match: /^\/complaints$/, segments: [{ label: "Réclamations" }] },
  { match: /^\/account\/addresses$/, segments: [{ label: "Compte", href: "/account" }, { label: "Adresses" }] },
  { match: /^\/account\/settings$/, segments: [{ label: "Compte", href: "/account" }, { label: "Paramètres" }] },
  { match: /^\/account$/, segments: [{ label: "Mon Profil" }] },
];

export function BuyerTopbar({ session }: { session: SessionUser }) {
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);

  const segments = breadcrumbMap.find((item) => item.match.test(pathname))?.segments ?? [{ label: "Portail Acheteur" }];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 shadow-sm backdrop-blur-sm lg:px-6">
      {/* Mobile hamburger */}
      <BuyerMobileNav />

      {/* Breadcrumb */}
      <nav aria-label="fil d'ariane" className="hidden items-center gap-1.5 sm:flex">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Portail
        </Link>
        {segments.map((segment, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {segment.href && i < segments.length - 1 ? (
              <Link href={segment.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {segment.label}
              </Link>
            ) : (
              <span className={cn("text-sm", i === segments.length - 1 ? "font-medium text-foreground" : "text-muted-foreground")}>
                {segment.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Mobile: just show last segment */}
      <p className="text-sm font-medium text-foreground sm:hidden">
        {segments[segments.length - 1]?.label ?? "Portail Acheteur"}
      </p>

      <div className="flex-1" />

      {/* Search bar */}
      <div
        className={cn(
          "hidden items-center gap-2 rounded-lg border bg-muted px-3 py-2 transition-all lg:flex lg:w-60",
          searchFocused ? "border-primary/50 bg-background shadow-sm w-72" : "border-transparent"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          placeholder="Chercher un produit, une commande..."
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Language switcher */}
      <LanguageSwitcher />

      {/* Notification bell */}
      <NotificationPanel />

      {/* User avatar menu */}
      <UserMenu session={session} />
    </header>
  );
}
