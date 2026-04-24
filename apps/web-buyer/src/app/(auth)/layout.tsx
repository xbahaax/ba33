import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck, Package, Truck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Catalogue certifié",
    desc: "Parcourez des produits lainiers avec sceau NFN garanti",
  },
  {
    icon: ShieldCheck,
    title: "Traçabilité complète",
    desc: "De la brebis au produit fini — chaque étape vérifiable",
  },
  {
    icon: Truck,
    title: "Suivi en temps réel",
    desc: "Tracking de vos commandes et expéditions en direct",
  },
  {
    icon: BarChart3,
    title: "Gestion simplifiée",
    desc: "Documents, réclamations et factures centralisés",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ─── Left decorative panel (desktop only) ─── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar lg:flex lg:w-[45%] xl:w-[40%]">
        {/* Subtle background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--sidebar-foreground) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <span className="font-serif text-base font-bold text-primary-foreground">b</span>
            </div>
            <div>
              <p className="font-serif text-2xl leading-none text-sidebar-foreground">ba33</p>
              <p className="font-mono text-[10px] text-muted-foreground">Plateforme de traçabilité lainière</p>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Portail Acheteur
              </p>
              <h2 className="text-3xl font-bold leading-tight text-sidebar-foreground">
                La laine algérienne, certifiée et traçable
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Accédez aux meilleurs produits lainiers certifiés NFN. Vérifiez la provenance, passez vos commandes et gérez vos documents en un seul endroit.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sidebar-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div>
            <p className="font-mono text-xs text-muted-foreground/60">
              © 2024 ba33 Platform — Plateforme agréée par l&apos;ONTA
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right auth form panel ─── */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo (hidden on desktop) */}
          <div className="space-y-1 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-serif text-sm font-bold text-primary-foreground">b</span>
              </div>
              <span className="font-serif text-3xl text-foreground">ba33</span>
            </Link>
            <p className="text-sm text-muted-foreground">Portail Acheteur</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
