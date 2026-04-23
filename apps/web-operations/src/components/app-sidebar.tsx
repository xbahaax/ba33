"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
} from "@ba33/ui-web";
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
} from "lucide-react";
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            b
          </div>
          <div>
            <p className="text-sm font-semibold">ba33</p>
            <p className="text-xs text-muted-foreground">Opérations</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav>
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              active={pathname === item.href}
              icon={<item.icon className="h-4 w-4" />}
            >
              {item.label}
            </SidebarNavItem>
          ))}
        </SidebarNav>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-muted-foreground">ba33 v0.1.0</p>
      </SidebarFooter>
    </Sidebar>
  );
}
