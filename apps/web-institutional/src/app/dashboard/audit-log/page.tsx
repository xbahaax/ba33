"use client";

import { useState } from "react";
import { Card, CardContent, Badge } from "@ba33/ui-web";
import { Shield, Search, Download } from "lucide-react";
import { AUDIT_LOG, type AuditEntry } from "@/lib/mock-data";

const QUERY_TYPE_LABELS: Record<AuditEntry["queryType"], string> = {
  lot_lookup: "Consultation lot",
  cert_verify: "Vérif. certificat",
  aggregate_stats: "Statistiques",
  export: "Export données",
  shepherd_lookup: "Lookup éleveur",
};

const QUERY_TYPE_COLORS: Record<AuditEntry["queryType"], string> = {
  lot_lookup: "border-primary text-primary",
  cert_verify: "border-success text-success",
  aggregate_stats: "border-info text-info",
  export: "border-warning text-warning",
  shepherd_lookup: "border-destructive text-destructive",
};

export default function AuditLogPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = AUDIT_LOG.filter((e) => {
    const matchType = filter === "all" || e.queryType === filter;
    const matchSearch =
      !search ||
      e.institution.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase()) ||
      e.queryParams.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal d&apos;audit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toutes les requêtes institutionnelles — immuablement enregistrées. Visible par l&apos;autorité NFN.
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors">
          <Download className="h-4 w-4" />
          Exporter journal
        </button>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Journal immuable</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            Ce journal est en lecture seule. Chaque entrée est cryptographiquement signée et ne peut pas être modifiée ou supprimée. Il est visible par les administrateurs NFN et les institutions concernées.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Requêtes aujourd'hui", value: "8" },
          { label: "Cette semaine", value: "47" },
          { label: "Institutions actives", value: "4" },
          { label: "Avec justification", value: "3" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xl font-bold font-mono">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Rechercher par institution, utilisateur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="all">Tous les types</option>
          <option value="lot_lookup">Consultation lot</option>
          <option value="cert_verify">Vérification certificat</option>
          <option value="aggregate_stats">Statistiques</option>
          <option value="export">Export</option>
          <option value="shepherd_lookup">Lookup éleveur</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                <th className="text-left py-3 pr-4">Horodatage</th>
                <th className="text-left py-3 px-4">Institution</th>
                <th className="text-left py-3 px-4">Utilisateur</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Paramètres</th>
                <th className="text-right py-3 px-4">Résultats</th>
                <th className="text-left py-3 pl-4">Justif.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {entry.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">{entry.institution}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground truncate max-w-32">
                    {entry.user}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`text-xs ${QUERY_TYPE_COLORS[entry.queryType]}`}
                    >
                      {QUERY_TYPE_LABELS[entry.queryType]}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-48 truncate">
                    {entry.queryParams}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs">
                    {entry.resultCount}
                  </td>
                  <td className="py-3 pl-4 text-xs">
                    {entry.justification ? (
                      <span className="text-foreground" title={entry.justification}>
                        ✓ {entry.justification.slice(0, 20)}…
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    Aucune entrée correspondant aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
