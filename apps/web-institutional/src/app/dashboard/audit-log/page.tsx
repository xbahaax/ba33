"use client";

import { useState } from "react";
import {
  Card, CardContent, Badge, Input,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@ba33/ui-web";
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs uppercase">Horodatage</TableHead>
                <TableHead className="text-xs uppercase">Institution</TableHead>
                <TableHead className="text-xs uppercase">Utilisateur</TableHead>
                <TableHead className="text-xs uppercase">Type</TableHead>
                <TableHead className="text-xs uppercase">Paramètres</TableHead>
                <TableHead className="text-xs uppercase text-right">Résultats</TableHead>
                <TableHead className="text-xs uppercase">Justif.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {entry.timestamp}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-xs">{entry.institution}</Badge>
                  </TableCell>
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground max-w-32 truncate">
                    {entry.user}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${QUERY_TYPE_COLORS[entry.queryType]}`}
                    >
                      {QUERY_TYPE_LABELS[entry.queryType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-muted-foreground max-w-48 truncate">
                    {entry.queryParams}
                  </TableCell>
                  <TableCell className="py-3 text-right font-mono text-xs">
                    {entry.resultCount}
                  </TableCell>
                  <TableCell className="py-3 text-xs">
                    {entry.justification ? (
                      <span className="text-foreground" title={entry.justification}>
                        ✓ {entry.justification.slice(0, 20)}…
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune entrée correspondant aux filtres.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
