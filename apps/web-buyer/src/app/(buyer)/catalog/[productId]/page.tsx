import { ProductImageGallery } from "@/components/buyer/product/product-image-gallery";
import { QualityParameters } from "@/components/buyer/product/quality-parameters";
import { TraceabilityTimeline } from "@/components/buyer/product/traceability-timeline";
import { TraceabilityMap } from "@/components/buyer/product/traceability-map";
import { GradeBadge } from "@/components/buyer/shared/grade-badge";
import { NfnSealBadge } from "@/components/buyer/catalog/nfn-seal-badge";
import { ProductPurchasePanel } from "@/components/buyer/product/product-purchase-panel";
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

      <ProductPurchasePanel product={product} />
    </div>
  );
}
