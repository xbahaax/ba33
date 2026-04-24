'use client';

import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, Building2, FileText, Shield, LogOut, Home } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home },
  { href: '/dashboard/lots', label: 'Lots', icon: BarChart3 },
  { href: '/dashboard/sources', label: 'Sources', icon: Building2 },
  { href: '/dashboard/rapports', label: 'Rapports', icon: FileText },
  { href: '/dashboard/conformite', label: 'Conformité', icon: Shield },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('ba33_token');
    localStorage.removeItem('ba33_refresh');
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold">
              b
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">ba33</p>
              <p className="text-xs text-muted-foreground">Portail Institutionnel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
