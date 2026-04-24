import Link from "next/link";
import { Clock, FileText, ShieldCheck, ShoppingCart } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { ProductImageGallery } from "@/components/buyer/product/product-image-gallery";
import { QualityParameters } from "@/components/buyer/product/quality-parameters";
import { TraceabilityTimeline } from "@/components/buyer/product/traceability-timeline";
import { TraceabilityMap } from "@/components/buyer/product/traceability-map";
import { GradeBadge } from "@/components/buyer/shared/grade-badge";
import { NfnSealBadge } from "@/components/buyer/catalog/nfn-seal-badge";
import { products } from "@/lib/mock/products";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return <div className="rounded-xl border border-border bg-card p-6 shadow-xs">Produit introuvable.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[7fr_5fr]">
      <div className="space-y-6">
        <ProductImageGallery images={product.images} name={product.name} />

        <section className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
          <p className="font-mono text-sm text-muted-foreground">{product.code}</p>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <div className="flex flex-wrap gap-2">
              <GradeBadge grade={product.grade} />
              <NfnSealBadge status={product.nfnSealStatus} />
              <span className="inline-flex rounded-sm border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                {product.type}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        </section>

        <QualityParameters qualityParameters={product.qualityParameters} />
        <TraceabilityTimeline traceability={product.traceability} />
        <TraceabilityMap region={product.region} />
      </div>

      <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
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
                <button type="button" className="px-3 py-2 text-muted-foreground">-</button>
                <input type="number" defaultValue={50} min={50} max={product.availableQuantityKg} className="w-28 border-x border-input bg-background px-3 py-2 text-center font-mono text-sm outline-none" />
                <button type="button" className="px-3 py-2 text-muted-foreground">+</button>
              </div>
              <p className="font-mono font-semibold text-foreground">Total estimé : {new Intl.NumberFormat("fr-FR").format(product.pricePerKgDzd * 50)} DZD</p>
            </div>

            <div className="space-y-3">
              <Button className="w-full">
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4" />
                Demander un devis
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Canal de vente</p>
              <div className="space-y-2">
                {[
                  "🇩🇿 National (DZD)",
                  "🌍 Export (EUR/USD)",
                  "🏛 Institutionnel (contrat cadre)",
                ].map((option, index) => (
                  <label key={option} className={index === 0 ? "flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 text-sm" : "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm"}>
                    <input type="radio" name="channel" defaultChecked={index === 0} />
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
              <p className="text-xs text-muted-foreground">
                Certifie le {product.nfnCertifiedAt?.toLocaleDateString("fr-FR")}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/verify?code=${product.nfnSealCode}`}>Verifier en ligne</Link>
              </Button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
