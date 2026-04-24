import Link from "next/link";
import { MapPin, Package, ShoppingCart } from "lucide-react";
import { Button } from "@ba33/ui-web";
import type { Product } from "@/lib/types/product";
import { GradeBadge } from "@/components/buyer/shared/grade-badge";
import { NfnSealBadge } from "@/components/buyer/catalog/nfn-seal-badge";
import { WeightDisplay } from "@/components/buyer/shared/weight-display";

export function ProductCard({ product, view }: { product: Product; view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <article className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border/80 md:flex-row">
        <div className="relative h-24 shrink-0 overflow-hidden rounded-lg bg-muted md:w-24">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Package className="h-8 w-8 opacity-40" />
          </div>
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <GradeBadge grade={product.grade} />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs text-muted-foreground">{product.code}</p>
              <NfnSealBadge status={product.nfnSealStatus} />
            </div>
            <h3 className="text-base font-semibold text-card-foreground">{product.name}</h3>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {product.region}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <WeightDisplay valueKg={product.availableQuantityKg} />
              <p className="font-mono text-lg font-bold text-primary">
                {new Intl.NumberFormat("fr-FR").format(product.pricePerKgDzd)} DZD/kg
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/catalog/${product.id}`}>Voir détails</Link>
              </Button>
              <Button size="sm" type="button">
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20">
      {/* Image zone */}
      <div className="relative h-52 overflow-hidden bg-muted">
        {/* Placeholder icon */}
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Package className="h-12 w-12 opacity-30 transition-transform duration-300 group-hover:scale-110" />
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/60 to-transparent" />

        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <GradeBadge grade={product.grade} />
          <NfnSealBadge status={product.nfnSealStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Header info */}
        <div className="space-y-1">
          <p className="font-mono text-xs text-muted-foreground">{product.code}</p>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-card-foreground">
            {product.name}
          </h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {product.region}
          </p>
        </div>

        {/* Separator */}
        <div className="h-px bg-border" />

        {/* Price & availability */}
        <div className="space-y-1.5">
          <WeightDisplay valueKg={product.availableQuantityKg} />
          <p className="font-mono text-xl font-bold text-primary">
            {new Intl.NumberFormat("fr-FR").format(product.pricePerKgDzd)}{" "}
            <span className="text-base font-semibold">DZD/kg</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button asChild variant="outline" className="flex-1 text-sm">
            <Link href={`/catalog/${product.id}`}>Voir détails</Link>
          </Button>
          <Button className="flex-1 text-sm" type="button">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Ajouter
          </Button>
        </div>
      </div>
    </article>
  );
}
