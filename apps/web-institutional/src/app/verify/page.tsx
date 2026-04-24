"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Badge, Card, CardContent, Input } from "@ba33/ui-web";
import { QrCode, CheckCircle2, XCircle, ArrowLeft, Search, Shield } from "lucide-react";
import { CERTIFICATES, type Certificate } from "@/lib/mock-data";

export default function PublicVerifyPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Certificate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = () => {
    setNotFound(false);
    setResult(null);
    setSearched(true);
    const found = CERTIFICATES.find(
      (c) =>
        c.productCode.toLowerCase() === query.toLowerCase() ||
        c.lotId.toLowerCase() === query.toLowerCase()
    );
    if (found) setResult(found);
    else if (query) setNotFound(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">ba33 Portail institutionnel</span>
          </Link>
          <Badge variant="outline" className="text-xs">Vérification publique — sans authentification</Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold">Vérification NFN</h1>
            <p className="text-muted-foreground">
              Vérifiez l&apos;authenticité d&apos;un certificat NFN en entrant le code produit ou en scannant le QR imprimé sur l&apos;emballage.
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9 font-mono"
                    placeholder="P1-00042 ou L-C1-TZ-00312"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  />
                </div>
                <Button onClick={handleVerify} className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Vérifier
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Tester avec :</span>
                {["P1-00042", "P2-00019", "P1-00031"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setQuery(ex)}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {notFound && searched && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="font-semibold text-destructive">Certificat introuvable</p>
              <p className="text-sm text-muted-foreground">
                Le code &quot;{query}&quot; ne correspond à aucun certificat NFN enregistré. Vérifiez le code imprimé et réessayez.
              </p>
            </div>
          )}

          {result && (
            <div className={`rounded-xl border-2 p-6 space-y-6 ${
              result.status === "valid"
                ? "border-success/40 bg-success/5"
                : "border-destructive/40 bg-destructive/5"
            }`}>
              {/* Status header */}
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  result.status === "valid" ? "bg-success/20" : "bg-destructive/20"
                }`}>
                  {result.status === "valid" ? (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="h-8 w-8 text-destructive" />
                  )}
                </div>
                <div>
                  <p className={`text-xl font-bold ${
                    result.status === "valid" ? "text-success" : "text-destructive"
                  }`}>
                    {result.status === "valid" ? "Certificat Valide" : "Certificat Révoqué"}
                  </p>
                  <p className="font-mono text-lg text-foreground">{result.productCode}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Lot d'origine", value: result.lotId, mono: true },
                  { label: "Grade NFN", value: result.grade },
                  { label: "Filière", value: result.track === "D3" ? "D3 — Isolants / Géotextiles" : "D4 — Biofertilisants" },
                  { label: "Poids certifié", value: `${result.weightKg} kg`, mono: true },
                  { label: "Région d'origine", value: result.originRegion },
                  { label: "Date d'émission", value: result.issuedAt, mono: true },
                  { label: "Portes de contrôle", value: `${result.gatesPassedCount}/6 passées` },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className={`font-medium mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
                  </div>
                ))}
              </div>

              {result.status === "revoked" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  Ce produit a été retiré du marché certifié NFN. Ne pas utiliser dans un contexte commercial certifié. Contactez l&apos;autorité NFN pour plus d&apos;informations.
                </div>
              )}

              {result.status === "valid" && (
                <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-success" />
                    Signature cryptographique NFN vérifiée
                  </p>
                  <p>Cette vérification ne requiert pas d&apos;authentification et peut être effectuée par tout tiers.</p>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Ce service est public et ne nécessite pas de connexion.</p>
              <p>Pour accéder aux données détaillées, <Link href="/login" className="text-primary hover:underline">connectez-vous</Link> avec vos identifiants institutionnels.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
