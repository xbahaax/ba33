"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from "@ba33/ui-web";
import { Search, QrCode, Package, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { MOCK_LOTS, CERTIFICATES, type MockLot, type Certificate } from "@/lib/mock-data";

type TabType = "lots" | "certificates";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  collected: { label: "Collecté", color: "text-info" },
  in_transit: { label: "En transit", color: "text-warning" },
  received_depot: { label: "Dépôt reçu", color: "text-muted-foreground" },
  washing: { label: "En lavage", color: "text-primary" },
  qualified: { label: "Qualifié", color: "text-success" },
  certified: { label: "Certifié NFN", color: "text-success" },
  sold: { label: "Vendu", color: "text-muted-foreground" },
};

export default function QueriesPage() {
  const [tab, setTab] = useState<TabType>("lots");
  const [query, setQuery] = useState("");
  const [searchedLot, setSearchedLot] = useState<MockLot | null>(null);
  const [searchedCert, setSearchedCert] = useState<Certificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [justification, setJustification] = useState("");
  const [showJustification, setShowJustification] = useState(false);

  const handleLotSearch = () => {
    setNotFound(false);
    setSearchedLot(null);
    const found = MOCK_LOTS.find(
      (l) =>
        l.id.toLowerCase().includes(query.toLowerCase()) ||
        l.qrCode.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setSearchedLot(found);
    } else if (query) {
      setNotFound(true);
    }
  };

  const handleCertSearch = () => {
    setNotFound(false);
    setSearchedCert(null);
    const found = CERTIFICATES.find(
      (c) =>
        c.productCode.toLowerCase().includes(query.toLowerCase()) ||
        c.lotId.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setSearchedCert(found);
    } else if (query) {
      setNotFound(true);
    }
  };

  const handleSearch = () => {
    if (tab === "lots") handleLotSearch();
    else handleCertSearch();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Requêtes de cas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toutes les requêtes sont immutablement journalisées avec votre identifiant.
        </p>
      </div>

      {/* Audit notice */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Conformément à l&apos;accord d&apos;accès institutionnel, chaque requête est enregistrée dans le journal d&apos;audit NFN. Les données personnelles des éleveurs nécessitent une justification.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30 w-fit">
        {(["lots", "certificates"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setQuery(""); setSearchedLot(null); setSearchedCert(null); setNotFound(false); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "lots" ? "Lots" : "Certificats NFN"}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={
                  tab === "lots"
                    ? "Code lot ex: L-C1-TZ-00312 ou QR ex: C1-00312-X7K"
                    : "Code produit ex: P1-00042 ou lot ex: L-C1-TZ-00312"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
          </div>

          {/* Quick examples */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Exemples :</span>
            {(tab === "lots"
              ? ["L-C1-TZ-00312", "C2-00044-Z9P", "L-C3-ORA-00202"]
              : ["P1-00042", "P2-00019", "L-C1-BOU-00143"]
            ).map((ex) => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); }}
                className="font-mono text-xs text-primary hover:underline"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {notFound && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-lg border border-border">
          <XCircle className="h-4 w-4 text-destructive" />
          Aucun résultat pour &quot;{query}&quot;. Vérifiez le code et réessayez.
        </div>
      )}

      {searchedLot && (
        <LotResult lot={searchedLot} />
      )}

      {searchedCert && (
        <CertResult cert={searchedCert} />
      )}

      {/* Recent lots table */}
      {!searchedLot && !searchedCert && !notFound && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {tab === "lots" ? "Lots récents — aperçu" : "Certificats récents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tab === "lots" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                    <th className="text-left py-2 pr-4">ID Lot</th>
                    <th className="text-left py-2 px-4">Source</th>
                    <th className="text-left py-2 px-4">Région</th>
                    <th className="text-right py-2 px-4">Poids</th>
                    <th className="text-left py-2 pl-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LOTS.map((lot) => {
                    const st = STATUS_CONFIG[lot.status];
                    return (
                      <tr key={lot.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2.5 pr-4 font-mono text-xs">{lot.id}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="text-xs font-mono">{lot.sourceType}</Badge>
                          {lot.isUrgent && <Badge variant="outline" className="text-xs ml-1 border-destructive text-destructive">URGENT</Badge>}
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs">{lot.region}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-xs">{lot.actualWeightKg} kg</td>
                        <td className={`py-2.5 pl-4 text-xs font-medium ${st.color}`}>{st.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                    <th className="text-left py-2 pr-4">Code produit</th>
                    <th className="text-left py-2 px-4">Grade</th>
                    <th className="text-left py-2 px-4">Origine</th>
                    <th className="text-right py-2 px-4">Poids</th>
                    <th className="text-left py-2 pl-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {CERTIFICATES.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 pr-4 font-mono text-xs">{c.productCode}</td>
                      <td className="py-2.5 px-4"><Badge variant="outline" className="text-xs">{c.grade}</Badge></td>
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{c.originRegion}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs">{c.weightKg} kg</td>
                      <td className="py-2.5 pl-4">
                        {c.status === "valid" ? (
                          <span className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Valide
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <XCircle className="h-3.5 w-3.5" /> Révoqué
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LotResult({ lot }: { lot: MockLot }) {
  const st = STATUS_CONFIG[lot.status];
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">{lot.id}</CardTitle>
          <span className={`text-sm font-medium ${st.color}`}>{st.label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Code QR", value: lot.qrCode, mono: true },
            { label: "Type source", value: lot.sourceType },
            { label: "Région (wilaya)", value: lot.region },
            { label: "Poids déclaré", value: `${lot.declaredWeightKg} kg`, mono: true },
            { label: "Poids réel", value: `${lot.actualWeightKg} kg`, mono: true },
            { label: "Date collecte", value: lot.collectedAt, mono: true },
            { label: "Grade", value: lot.grade ?? "En cours" },
            { label: "Urgence", value: lot.isUrgent ? "OUI (C2)" : "Non" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className={`font-medium mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Données personnelles de l&apos;éleveur abstrayées. Cette requête a été journalisée.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CertResult({ cert }: { cert: Certificate }) {
  return (
    <Card className={cert.status === "valid" ? "border-success/30" : "border-destructive/30"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">{cert.productCode}</CardTitle>
          {cert.status === "valid" ? (
            <span className="flex items-center gap-1.5 text-sm text-success font-medium">
              <CheckCircle2 className="h-4 w-4" /> Certificat valide
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-destructive font-medium">
              <XCircle className="h-4 w-4" /> Certificat révoqué
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Lot source", value: cert.lotId, mono: true },
            { label: "Grade NFN", value: cert.grade },
            { label: "Filière", value: cert.track === "D3" ? "D3 — Textiles / Isolants" : "D4 — Biofertilisants" },
            { label: "Poids certifié", value: `${cert.weightKg} kg`, mono: true },
            { label: "Région d'origine", value: cert.originRegion },
            { label: "Émis le", value: cert.issuedAt, mono: true },
            { label: "Portes passées", value: `${cert.gatesPassedCount}/6` },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className={`font-medium mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
            </div>
          ))}
        </div>
        {cert.status === "revoked" && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs text-destructive">Ce certificat a été révoqué suite à un litige qualité. Contactez l&apos;autorité NFN pour les détails.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
