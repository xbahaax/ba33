"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@ba33/ui-web";
import { BarChart3, Package, Users, MapPin, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { NATIONAL_KPIS, MONTHLY_PRODUCTION, AUDIT_LOG } from "@/lib/mock-data";
import { getSession, getInstitution } from "@/lib/auth";

export default function DashboardOverviewPage() {
  const [institution, setInstitution] = useState<ReturnType<typeof getInstitution>>(undefined);

  useEffect(() => {
    const s = getSession();
    if (s) setInstitution(getInstitution(s.institutionId));
  }, []);

  const maxKg = Math.max(...MONTHLY_PRODUCTION.map((m) => m.kg));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Données agrégées de la filière laine nationale — 2025
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Production nationale",
            value: "456 230 kg",
            sub: "+12.4% vs 2024",
            icon: BarChart3,
            positive: true,
          },
          {
            label: "Lots enregistrés",
            value: "2 341",
            sub: "dont 441 C2 (urgents)",
            icon: Package,
            positive: true,
          },
          {
            label: "Éleveurs inscrits",
            value: "847",
            sub: "8 wilayas actives",
            icon: Users,
            positive: true,
          },
          {
            label: "Rendement moyen",
            value: "62.4 %",
            sub: "après lavage (R1)",
            icon: TrendingUp,
            positive: true,
          },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">
                    {kpi.value}
                  </p>
                  <p className={`text-xs mt-1 ${kpi.positive ? "text-success" : "text-destructive"}`}>
                    {kpi.sub}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Production mensuelle 2025 (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-40">
              {MONTHLY_PRODUCTION.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                    style={{ height: `${(m.kg / maxKg) * 100}%` }}
                    title={`${m.month}: ${m.kg.toLocaleString()} kg`}
                  />
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <span>Pic: <span className="font-mono font-medium text-foreground">89 120 kg</span> (Mai)</span>
              <span>Moy: <span className="font-mono font-medium text-foreground">38 019 kg/mois</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Source type breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "C1 – Éleveur direct", pct: NATIONAL_KPIS.c1Percent, color: "bg-primary" },
              { label: "C2 – Abattoir", pct: NATIONAL_KPIS.c2Percent, color: "bg-warning" },
              { label: "C3 – Agrégateur", pct: NATIONAL_KPIS.c3Percent, color: "bg-info" },
            ].map((s) => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{s.label}</span>
                  <span className="font-mono font-medium">{s.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Total : {NATIONAL_KPIS.totalKg.toLocaleString()} kg · {NATIONAL_KPIS.totalLots} lots
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Wilayas actives</CardTitle>
            <Link href="/dashboard/statistics" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: "Tizi Ouzou", kg: 87_420, pct: 19.2 },
                { name: "Batna", kg: 61_250, pct: 13.4 },
                { name: "Bouira", kg: 64_180, pct: 14.1 },
                { name: "Sétif", kg: 52_670, pct: 11.5 },
              ].map((w) => (
                <div key={w.name} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-28">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{w.name}</span>
                  </div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${w.pct * 3}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                    {(w.kg / 1000).toFixed(1)}t
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent audit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Activité récente</CardTitle>
            <Link href="/dashboard/audit-log" className="text-xs text-primary hover:underline flex items-center gap-1">
              Journal complet <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AUDIT_LOG.slice(0, 4).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0 mt-0.5">
                    <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {entry.institution} — {entry.queryType.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {entry.timestamp}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {entry.resultCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
