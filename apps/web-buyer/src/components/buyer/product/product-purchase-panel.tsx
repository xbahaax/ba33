"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@ba33/ui-web";
import type { Product } from "@/lib/types/product";
import { addProductToCart } from "@/lib/cart-store";

const channels = [
  "🇩🇿 National (DZD)",
  "🌍 Export (EUR/USD)",
  "🏛 Institutionnel (contrat cadre)",
];

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantityKg, setQuantityKg] = useState(50);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const safeQuantity = Math.min(product.availableQuantityKg, Math.max(50, quantityKg));

  return (
    <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
      <section className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Prix unitaire</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-mono text-3xl font-bold text-primary">
                {new Intl.NumberFormat("fr-FR").format(product.pricePerKgDzd)} DZD
              </span>
              <span className="text-muted-foreground">/kg</span>
            </div>
            {product.pricePerKgEur ? <p className="text-xs text-muted-foreground">Prix canal export disponible</p> : null}
          </div>

          <div className="space-y-2">
            <p className="font-mono font-semibold text-foreground">{new Intl.NumberFormat("fr-FR").format(product.availableQuantityKg)} kg</p>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-chart-1 transition-all duration-500" style={{ width: `${Math.min(100, product.availableQuantityKg / 16)}%` }} />
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Delai de livraison estime : 7 jours
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Quantite</p>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-input">
              <button type="button" className="px-3 py-2 text-muted-foreground" onClick={() => setQuantityKg((value) => Math.max(50, value - 50))}>
                -
              </button>
              <input
                type="number"
                value={safeQuantity}
                min={50}
                max={product.availableQuantityKg}
                className="w-28 border-x border-input bg-background px-3 py-2 text-center font-mono text-sm outline-none"
                onChange={(event) => setQuantityKg(Number(event.target.value) || 50)}
              />
              <button type="button" className="px-3 py-2 text-muted-foreground" onClick={() => setQuantityKg((value) => Math.min(product.availableQuantityKg, value + 50))}>
                +
              </button>
            </div>
            <p className="font-mono font-semibold text-foreground">Total estimé : {new Intl.NumberFormat("fr-FR").format(product.pricePerKgDzd * safeQuantity)} DZD</p>
          </div>

          <div className="space-y-3">
            <Button
              size="sm"
              className="h-9 w-full whitespace-nowrap border border-border px-3 text-xs"
              type="button"
              onClick={() => {
                addProductToCart(product, safeQuantity);
                setFeedback(`${safeQuantity} kg ajoutés au panier.`);
              }}
            >
              Ajouter au panier
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => setFeedback("Demande de devis enregistrée en brouillon.")}
            >
              <FileText className="h-4 w-4" />
              Demander un devis
            </Button>
            {feedback ? <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{feedback}</p> : null}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Canal de vente</p>
            <div className="space-y-2">
              {channels.map((option, index) => (
                <label
                  key={option}
                  className={selectedChannel === index ? "flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-sm" : "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm"}
                >
                  <input type="radio" name="channel" checked={selectedChannel === index} onChange={() => setSelectedChannel(index)} />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-chart-1/30 bg-chart-1/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-chart-1" />
          <div className="space-y-2">
            <p className="font-mono text-sm font-bold text-chart-1">Sceau NFN #{product.nfnSealCode}</p>
            <p className="text-xs text-muted-foreground">Certifie le {product.nfnCertifiedAt?.toLocaleDateString("fr-FR")}</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/verify?code=${product.nfnSealCode}`}>Verifier en ligne</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
