"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle, Download, HelpCircle, QrCode, ShieldCheck, XCircle } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ba33/ui-web";
import type { Product } from "@/lib/types/product";
import { downloadTextFile } from "@/lib/download-file";

export function VerifyCertificateClient({
  initialMode,
  initialCode,
  products,
}: {
  initialMode: "code" | "qr";
  initialCode: string;
  products: Product[];
}) {
  const [mode, setMode] = useState<"code" | "qr">(initialMode);
  const [code, setCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);

  const product = useMemo(
    () => products.find((item) => item.nfnSealCode?.toLowerCase() === submittedCode.toLowerCase()),
    [products, submittedCode]
  );

  return (
    <div className="mx-auto max-w-160 py-10 lg:py-16">
      <Card className="rounded-xl shadow-xs">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">Vérification de Certificat NFN</CardTitle>
            <CardDescription>Vérifiez l&apos;authenticité d&apos;un produit certifié ba33/NFN</CardDescription>
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
              <p className="text-sm text-muted-foreground">Pointez vers le QR du certificat</p>
            </div>
          ) : (
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
                placeholder="NFN-P1-00042-X7..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
                onChange={(event) => setCode(event.target.value)}
              />
              <Button className="w-full" type="submit">
                Vérifier
              </Button>
            </form>
          )}

          {submittedCode ? (
            product?.nfnSealStatus === "certified" ? (
              <section className="rounded-xl border-2 border-primary bg-primary/10 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-primary">Certificat Valide</h2>
                    <div className="grid gap-2 text-sm text-foreground">
                      <p>Code produit : <span className="font-mono">{product.code}</span></p>
                      <p>Grade : <span className="font-mono">{product.grade}</span></p>
                      <p>Région : {product.region}</p>
                      <p>Date certification : {product.nfnCertifiedAt?.toLocaleDateString("fr-FR")}</p>
                      <p>Statut : ✓ Actif</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild>
                        <Link href={`/catalog/${product.id}`}>Voir la traçabilité complète</Link>
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() =>
                          downloadTextFile(
                            `${product.nfnSealCode}.txt`,
                            `Certificat NFN\nCode: ${product.nfnSealCode}\nProduit: ${product.name}\nRegion: ${product.region}`
                          )
                        }
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Télécharger le certificat PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            ) : product?.nfnSealStatus === "revoked" ? (
              <section className="rounded-xl border-2 border-destructive bg-destructive/10 p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-destructive">Certificat Révoqué</h2>
                    <p className="text-sm text-foreground">Motif de révocation : lot suspendu après contrôle documentaire.</p>
                    <p className="text-sm text-muted-foreground">Date : 12/03/2026</p>
                    <p className="text-sm text-muted-foreground">Contact support : support@ba33.dz</p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-border bg-muted p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Aucun certificat trouvé pour ce code</h2>
                    <p className="text-sm text-muted-foreground">Vérifiez la saisie et réessayez avec le code complet du certificat.</p>
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
