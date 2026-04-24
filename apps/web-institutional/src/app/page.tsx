import Link from "next/link";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription } from "@ba33/ui-web";
import {
  Building2,
  BarChart3,
  FileText,
  Shield,
  Search,
  Lock,
  QrCode,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm font-mono">
              b
            </div>
            <span className="font-semibold text-foreground">ba33</span>
            <Badge variant="outline" className="text-xs">
              Interface de Sécurité
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/verify">
              <Button variant="ghost" size="sm" className="gap-2">
                <QrCode className="h-4 w-4" />
                Vérifier un certificat
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="gap-2">
                <Lock className="h-4 w-4" />
                Connexion institutionnelle
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Accès réservé aux institutions habilitées — lecture seule
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
            Portail Institutionnel NFN
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Supervision sécurisée de la filière laine nationale.
            Statistiques agrégées, traçabilité et conformité réglementaire
            pour les ministères et régulateurs algériens.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Accéder au portail
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" size="lg" className="gap-2">
                <QrCode className="h-4 w-4" />
                Vérification publique
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Stats banner ── */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Kg collectés (2025)", value: "456 230 kg", mono: true },
                { label: "Lots enregistrés", value: "2 341", mono: true },
                { label: "Éleveurs inscrits", value: "847", mono: false },
                { label: "Wilayas actives", value: "8 / 58", mono: true },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className={`text-3xl font-bold text-foreground ${s.mono ? "font-mono" : ""}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Modules disponibles selon mandat
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BarChart3,
                title: "Statistiques nationales",
                desc: "Production par wilaya, tendances saisonnières, indicateurs économiques agrégés.",
                for: ["Agriculture", "Commerce", "ONS", "Douanes"],
              },
              {
                icon: Search,
                title: "Requêtes de cas",
                desc: "Recherche de lots par QR code, consultation de produits, vérification de certificats NFN.",
                for: ["Agriculture", "Commerce", "Douanes"],
              },
              {
                icon: FileText,
                title: "Rapports réglementaires",
                desc: "Génération automatique des rapports périodiques selon les obligations de chaque institution.",
                for: ["Agriculture", "Commerce", "Douanes", "ONS"],
              },
              {
                icon: Shield,
                title: "Journal d'audit",
                desc: "Toutes les requêtes institutionnelles sont immuablement journalisées. Visible par l'autorité NFN.",
                for: ["Agriculture", "Commerce", "Douanes"],
              },
            ].map((f) => (
              <Card key={f.title} className="border-border">
                <CardHeader>
                  <f.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription className="text-sm">{f.desc}</CardDescription>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {f.for.map((inst) => (
                      <Badge key={inst} variant="outline" className="text-xs">
                        {inst}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Institutions ── */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto px-6 py-16">
            <h2 className="text-xl font-semibold text-center mb-8 text-muted-foreground">
              Institutions habilitées
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "Ministère de l'Agriculture",
                "Ministère du Commerce",
                "Direction Générale des Douanes",
                "Office National des Statistiques",
              ].map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2025 ba33 — Plateforme NFN de traçabilité laine · Algérie</span>
          <span className="font-mono text-xs">v1.0.0 · Interface de Sécurité</span>
        </div>
      </footer>
    </div>
  );
}
