"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Download, HelpCircle, LoaderCircle, QrCode, ShieldCheck, XCircle } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ba33/ui-web";
import { downloadTextFile } from "@/lib/download-file";
import { verifyCertificate, type CertificationVerification } from "@/lib/api/buyer-api";

export function VerifyCertificateClient({
  initialMode,
  initialCode,
}: {
  initialMode: "code" | "qr";
  initialCode: string;
}) {
  const [mode, setMode] = useState<"code" | "qr">(initialMode);
  const [code, setCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);
  const [result, setResult] = useState<CertificationVerification | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submittedCode) {
      return;
    }

    let active = true;

    void (async () => {
      setLoading(true);
      try {
        const verification = await verifyCertificate(submittedCode, mode);
        if (active) {
          setResult(verification);
        }
      } catch {
        if (active) {
          setResult({ code: submittedCode, status: "not_found" });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [mode, submittedCode]);

  return (
    <div className="mx-auto max-w-160 py-10 lg:py-16">
      <Card className="rounded-xl shadow-xs">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">Verification de Certificat NFN</CardTitle>
            <CardDescription>Verifiez l&apos;authenticite d&apos;un produit certifie ba33/NFN</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              className={mode === "code" ? "rounded-lg bg-background px-4 py-2 text-center text-sm font-medium text-foreground shadow-xs" : "rounded-lg px-4 py-2 text-center text-sm text-muted-foreground"}
              onClick={() => setMode("code")}
            >
              Entrer un code
            </button>
            <button
              type="button"
              className={mode === "qr" ? "rounded-lg bg-background px-4 py-2 text-center text-sm font-medium text-foreground shadow-xs" : "rounded-lg px-4 py-2 text-center text-sm text-muted-foreground"}
              onClick={() => setMode("qr")}
            >
              Scanner un QR
            </button>
          </div>

          {mode === "qr" ? (
            <div className="space-y-4 rounded-xl bg-muted p-6 text-center">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-background text-muted-foreground">
                <QrCode className="h-20 w-20" />
              </div>
              <p className="text-sm text-muted-foreground">Saisissez le hash QR dans le champ puis cliquez sur Verifier.</p>
            </div>
          ) : null}

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedCode(code.trim());
            }}
          >
            <input
              type="text"
              name="code"
              value={code}
              placeholder={mode === "qr" ? "qr-hash..." : "NFN-P1-00042-X7..."}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
              onChange={(event) => setCode(event.target.value)}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Verification..." : "Verifier"}
            </Button>
          </form>

          {loading ? (
            <section className="rounded-xl border border-border bg-muted p-6 text-center text-muted-foreground">
              <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
              <p className="mt-2 text-sm">Verification du certificat...</p>
            </section>
          ) : null}

          {result && !loading ? (
            result.status === "valid" ? (
              <section className="rounded-xl border-2 border-primary bg-primary/10 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-primary">Certificat Valide</h2>
                    <div className="grid gap-2 text-sm text-foreground">
                      <p>Code : <span className="font-mono">{result.code}</span></p>
                      <p>Type produit : <span className="font-mono">{result.productType}</span></p>
                      <p>Grade : <span className="font-mono">{result.grade}</span></p>
                      <p>Region : {result.originRegion}</p>
                      <p>Date certification : {result.certifiedAt ? new Date(result.certifiedAt).toLocaleDateString("fr-FR") : "-"}</p>
                    </div>
                    {result.traceabilitySummary ? (
                      <div className="rounded-lg border border-primary/30 bg-background p-3 text-xs space-y-1">
                        <p className="font-medium text-foreground">Traçabilité</p>
                        <p>Date de collecte : {result.traceabilitySummary.collectionDate ? new Date(result.traceabilitySummary.collectionDate).toLocaleDateString("fr-FR") : "-"}</p>
                        <p>Rendement de lavage : {result.traceabilitySummary.washingYieldPercent}%</p>
                        <p>Audits passés : {(result.traceabilitySummary.auditsPassed ?? []).join(" · ")}</p>
                        <p>Sources d&apos;origine : {result.traceabilitySummary.sourceCount}</p>
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() =>
                          downloadTextFile(
                            `${result.code}.txt`,
                            `Certificat NFN\nCode: ${result.code}\nProduit: ${result.productType}\nGrade: ${result.grade}\nRegion: ${result.originRegion}\nCertifie le: ${result.certifiedAt ?? "-"}`,
                          )
                        }
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Telecharger le certificat
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            ) : result.status === "revoked" ? (
              <section className="rounded-xl border-2 border-destructive bg-destructive/10 p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-destructive">Certificat Revoque</h2>
                    <p className="text-sm text-muted-foreground">Ce certificat n&apos;est plus valide.</p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-border bg-muted p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Aucun certificat trouve pour ce code</h2>
                    <p className="text-sm text-muted-foreground">Verifiez la saisie et reessayez avec le code complet.</p>
                  </div>
                </div>
              </section>
            )
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
