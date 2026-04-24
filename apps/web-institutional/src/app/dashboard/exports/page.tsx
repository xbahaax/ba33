"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from "@ba33/ui-web";
import { Download, FileText, CheckCircle2 } from "lucide-react";

const EXPORT_TYPES = [
  {
    id: "production",
    label: "Rapport de production",
    desc: "Volume collecté, lots, rendements par wilaya et par période.",
    formats: ["CSV", "XML"],
    mandates: ["agriculture", "ons"],
  },
  {
    id: "exports_declarations",
    label: "Déclarations d'export",
    desc: "Détail des lots exportés, destinations, valeurs FOB.",
    formats: ["CSV", "XML"],
    mandates: ["douanes", "commerce"],
  },
  {
    id: "economic_indicators",
    label: "Indicateurs économiques",
    desc: "Valeur commerciale, prix au kg, évolution saisonnière.",
    formats: ["CSV"],
    mandates: ["commerce", "ons"],
  },
  {
    id: "certification_registry",
    label: "Registre des certifications",
    desc: "Produits certifiés NFN, grades, poids, origines (agrégés).",
    formats: ["CSV", "XML"],
    mandates: ["agriculture", "commerce", "douanes"],
  },
  {
    id: "regional_stats",
    label: "Statistiques régionales",
    desc: "Données agrégées par wilaya — PII abstrayées.",
    formats: ["CSV", "XML"],
    mandates: ["agriculture", "ons", "commerce"],
  },
];

type Format = "CSV" | "XML";

export default function ExportsPage() {
  const [selectedExport, setSelectedExport] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>("CSV");
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-06-30");
  const [generated, setGenerated] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedExport) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setGenerated(selectedExport);
    setIsGenerating(false);
  };

  const exportType = EXPORT_TYPES.find((e) => e.id === selectedExport);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Exports de données</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exports filtrés selon votre mandat institutionnel. Données personnelles exclues par défaut.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORT_TYPES.map((exp) => (
          <button
            key={exp.id}
            onClick={() => { setSelectedExport(exp.id); setGenerated(null); }}
            className={`text-left rounded-lg border p-4 transition-colors ${
              selectedExport === exp.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <FileText className={`h-5 w-5 mt-0.5 shrink-0 ${selectedExport === exp.id ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium text-sm text-foreground">{exp.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{exp.desc}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              {exp.formats.map((f) => (
                <Badge key={f} variant="outline" className="text-xs font-mono">{f}</Badge>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Export config */}
      {selectedExport && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              Configuration — {exportType?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date de début</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date de fin</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Format</label>
              <div className="flex gap-2">
                {(exportType?.formats ?? []).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f as Format)}
                    className={`px-4 py-1.5 rounded-lg border text-sm font-mono font-medium transition-colors ${
                      format === f
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>Génération…</>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Générer et télécharger
                  </>
                )}
              </Button>
              {generated === selectedExport && !isGenerating && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Fichier prêt — téléchargement simulé
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cette opération sera journalisée dans le journal d&apos;audit avec votre identifiant institutionnel.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
