"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Badge, Button } from "@ba33/ui-web";
import { FileText, CheckCircle2, Clock, AlertCircle, Download, RefreshCw } from "lucide-react";
import { FILINGS, type Filing, type InstitutionMandate } from "@/lib/mock-data";
import { getSession, getInstitution } from "@/lib/auth";

const STATUS_CONFIG = {
  submitted: { label: "Déposé", icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/20" },
  generated: { label: "Généré", icon: Clock, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  pending: { label: "En attente", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted border-border" },
};

export default function FilingsPage() {
  const [mandate, setMandate] = useState<InstitutionMandate>("agriculture");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, Filing["status"]>>({});

  useEffect(() => {
    const s = getSession();
    if (s) {
      const inst = getInstitution(s.institutionId);
      if (inst) setMandate(inst.mandate as InstitutionMandate);
    }
  }, []);

  const myFilings = FILINGS.filter((f) => f.institution === mandate);

  const getStatus = (f: Filing): Filing["status"] => localStatuses[f.id] ?? f.status;

  const handleGenerate = async (filing: Filing) => {
    setGeneratingId(filing.id);
    await new Promise((r) => setTimeout(r, 1500));
    setLocalStatuses((prev) => ({ ...prev, [filing.id]: "generated" }));
    setGeneratingId(null);
  };

  const handleSubmit = async (filing: Filing) => {
    setGeneratingId(filing.id);
    await new Promise((r) => setTimeout(r, 1000));
    setLocalStatuses((prev) => ({ ...prev, [filing.id]: "submitted" }));
    setGeneratingId(null);
  };

  const submitted = myFilings.filter((f) => getStatus(f) === "submitted").length;
  const pending = myFilings.filter((f) => getStatus(f) === "pending").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Dépôts réglementaires</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rapports périodiques générés automatiquement depuis les données NFN.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xl font-bold font-mono text-success">{submitted}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Déposés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xl font-bold font-mono text-warning">
              {myFilings.filter((f) => getStatus(f) === "generated").length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Générés (à déposer)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xl font-bold font-mono">{pending}</p>
            <p className="text-xs text-muted-foreground mt-0.5">En attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filings list */}
      <div className="space-y-3">
        {myFilings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">Aucun dépôt réglementaire pour votre institution.</p>
            </CardContent>
          </Card>
        ) : (
          myFilings.map((filing) => {
            const status = getStatus(filing);
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isOverdue = status === "pending" && new Date(filing.dueDate) < new Date();
            const isGenerating = generatingId === filing.id;

            return (
              <div
                key={filing.id}
                className={`rounded-lg border p-5 transition-colors ${config.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border shrink-0`}>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{filing.title}</p>
                        <span className={`flex items-center gap-1 text-xs ${config.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                        {isOverdue && (
                          <Badge variant="outline" className="text-xs border-destructive text-destructive">
                            En retard
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{filing.type}</span>
                        <span>Période : {filing.period}</span>
                        <span className={`font-mono ${isOverdue ? "text-destructive" : ""}`}>
                          Échéance : {filing.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {status === "submitted" && (
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                      </button>
                    )}
                    {status === "generated" && (
                      <>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(filing)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? "Dépôt…" : "Déposer"}
                        </Button>
                      </>
                    )}
                    {status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerate(filing)}
                        disabled={isGenerating}
                        className="gap-1.5"
                      >
                        {isGenerating ? (
                          <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Génération…</>
                        ) : (
                          <>Générer</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Les rapports sont générés depuis les données NFN en temps réel. La soumission aux autorités compétentes est simulée dans cette version de démonstration.
      </p>
    </div>
  );
}
