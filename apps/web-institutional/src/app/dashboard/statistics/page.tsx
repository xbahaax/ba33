"use client";

import { useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell,
} from "@ba33/ui-web";
import { MapPin, TrendingUp, Package, Users, AlertTriangle } from "lucide-react";
import { ACTIVE_WILAYAS, MONTHLY_PRODUCTION, NATIONAL_KPIS } from "@/lib/mock-data";

const PERIODS = ["2025", "T2 2025", "T1 2025", "2024"];
const FILTERS = ["Toutes sources", "C1 uniquement", "C2 uniquement", "C3 uniquement"];

export default function StatisticsPage() {
  const [period, setPeriod] = useState("2025");
  const [filter, setFilter] = useState("Toutes sources");

  const maxKg = Math.max(...MONTHLY_PRODUCTION.map((m) => m.kg));
  const maxWilayaKg = Math.max(...ACTIVE_WILAYAS.map((w) => w.kg));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statistiques nationales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Indicateurs agrégés — données personnelles abstrayées par commune
          </p>
        </div>
        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          >
            {FILTERS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Volume total", value: `${(NATIONAL_KPIS.totalKg / 1000).toFixed(1)} t`, icon: Package },
          { label: "Lots collectés", value: NATIONAL_KPIS.totalLots.toLocaleString(), icon: Package },
          { label: "Éleveurs actifs", value: NATIONAL_KPIS.totalShepherds.toLocaleString(), icon: Users },
          { label: "Rendement R1 moyen", value: `${NATIONAL_KPIS.avgYieldPercent}%`, icon: TrendingUp },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold font-mono mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Production mensuelle — volume en kg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48 mb-3">
              {MONTHLY_PRODUCTION.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {m.kg >= 1000 ? `${(m.kg / 1000).toFixed(0)}k` : m.kg}
                  </span>
                  <div
                    className="w-full bg-primary/75 rounded-t hover:bg-primary transition-colors cursor-default"
                    style={{ height: `${Math.max((m.kg / maxKg) * 100, 4)}%` }}
                    title={`${m.month}: ${m.kg.toLocaleString()} kg — ${m.lots} lots`}
                  />
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Total 2025</p>
                <p className="font-mono font-semibold">{NATIONAL_KPIS.totalKg.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pic de production</p>
                <p className="font-mono font-semibold">Mai — 89 120 kg</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Saison (Mar–Juil)</p>
                <p className="font-mono font-semibold">319 180 kg (70%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seasonal trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendances saisonnières</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { season: "Printemps (Mar–Mai)", kg: 200_160, pct: 43.9, color: "bg-success" },
              { season: "Été (Juin–Août)", kg: 150_470, pct: 33.0, color: "bg-warning" },
              { season: "Automne (Sep–Nov)", kg: 59_030, pct: 12.9, color: "bg-info" },
              { season: "Hiver (Déc–Fév)", kg: 46_770, pct: 10.2, color: "bg-muted" },
            ].map((s) => (
              <div key={s.season} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.season}</span>
                  <span className="font-mono font-medium">{s.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct * 2}%` }} />
                </div>
                <p className="text-xs font-mono text-muted-foreground">{s.kg.toLocaleString()} kg</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Regional table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Répartition par wilaya</CardTitle>
          <Badge variant="outline" className="text-xs">8 wilayas actives / 58</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase">Wilaya</TableHead>
                <TableHead className="text-xs uppercase text-right">Volume (kg)</TableHead>
                <TableHead className="text-xs uppercase text-right">Lots</TableHead>
                <TableHead className="text-xs uppercase text-right">Éleveurs</TableHead>
                <TableHead className="text-xs uppercase">Part nationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTIVE_WILAYAS.map((w) => {
                const pct = ((w.kg / NATIONAL_KPIS.totalKg) * 100).toFixed(1);
                return (
                  <TableRow key={w.code}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{w.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{w.code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3 font-mono">{w.kg.toLocaleString()}</TableCell>
                    <TableCell className="text-right py-3 font-mono">{w.lots}</TableCell>
                    <TableCell className="text-right py-3 font-mono">{w.shepherds}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(w.kg / maxWilayaKg) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-xs text-muted-foreground py-2">TOTAL</TableCell>
                <TableCell className="text-right text-xs font-mono py-2">{NATIONAL_KPIS.totalKg.toLocaleString()}</TableCell>
                <TableCell className="text-right text-xs font-mono py-2">{NATIONAL_KPIS.totalLots}</TableCell>
                <TableCell className="text-right text-xs font-mono py-2">{NATIONAL_KPIS.totalShepherds}</TableCell>
                <TableCell className="text-xs text-muted-foreground py-2">100%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
            Les données individuelles des éleveurs sont abstrayées — seules les agrégations par commune sont visibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
