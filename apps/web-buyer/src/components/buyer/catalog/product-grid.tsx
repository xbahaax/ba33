import { PackageSearch } from "lucide-react";
import { Button } from "@ba33/ui-web";
import type { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/buyer/catalog/product-card";

export function ProductGrid({
  products,
  view,
}: {
  products: Product[];
  view: "grid" | "list";
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-xs">
        <PackageSearch className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-6 text-xl font-semibold text-foreground">Aucun produit trouve</h2>
        <p className="mt-2 text-sm text-muted-foreground">Essayez de modifier vos filtres.</p>
        <Button asChild className="mt-6">
          <a href="/catalog">Reinitialiser les filtres</a>
        </Button>
      </div>
    );
  }

  return (
    <div className={view === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} view={view} />
      ))}
    </div>
  );
}
