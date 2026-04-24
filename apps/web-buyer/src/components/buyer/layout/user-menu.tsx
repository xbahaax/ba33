"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@ba33/ui-web/cn";
import type { SessionUser } from "@/lib/api/buyer-api";
import { clearAuthToken } from "@/lib/auth/client-session";

const menuItems = [
  { href: "/account", label: "Mon Profil", icon: User },
  { href: "/account/settings", label: "Paramètres", icon: Settings },
];

function toInitials(fullName: string) {
  const [first, second] = fullName.split(" ").filter(Boolean);
  return `${first?.[0] ?? "B"}${second?.[0] ?? "A"}`.toUpperCase();
}

export function UserMenu({ session }: { session: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = toInitials(session.fullName);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Menu utilisateur"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-1.5 pr-2.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          open && "bg-accent text-accent-foreground"
        )}
      >
        {/* Avatar */}
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden font-medium lg:block">{session.profile.companyName}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="animate-scale-in absolute right-0 top-12 z-50 min-w-52 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{session.profile.companyName}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{session.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="border-t border-border p-1.5">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              onClick={() => {
                clearAuthToken();
                setOpen(false);
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
