import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { ProductFilters } from "@/components/buyer/catalog/product-filters";
import { ProductGrid } from "@/components/buyer/catalog/product-grid";
import { getProducts } from "@/lib/api/buyer-api";

type CatalogSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogPage({ searchParams }: { searchParams: CatalogSearchParams }) {
  const params = await searchParams;
  const type = getSingleParam(params.type);
  const grade = getSingleParam(params.grade);
  const region = getSingleParam(params.region);
  const sort = getSingleParam(params.sort) ?? "Prix croissant";
  const page = Number(getSingleParam(params.page) ?? "1");
  const view = getSingleParam(params.view) === "list" ? "list" : "grid";
  const stockOnly = getSingleParam(params.stock) === "1";
  const certifiedOnly = getSingleParam(params.nfn) === "1";
  const selectedGrades = (grade ?? "").split(",").filter(Boolean);

  const products = await getProducts();
  let filteredProducts = [...products];

  if (type && type !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.type === type);
  }

  if (selectedGrades.length > 0) {
    filteredProducts = filteredProducts.filter((product) => selectedGrades.includes(product.grade));
  }

  if (region && region !== "Toutes") {
    filteredProducts = filteredProducts.filter((product) => product.region === region);
  }

  if (stockOnly) {
    filteredProducts = filteredProducts.filter((product) => product.availableQuantityKg > 0);
  }

  if (certifiedOnly) {
    filteredProducts = filteredProducts.filter((product) => product.nfnSealStatus === "certified");
  }

  filteredProducts.sort((left, right) => {
    switch (sort) {
      case "Prix decroissant":
        return right.pricePerKgDzd - left.pricePerKgDzd;
      case "Grade (A→C)":
        return left.grade.localeCompare(right.grade);
      case "Disponibilite":
        return right.availableQuantityKg - left.availableQuantityKg;
      case "Plus recents":
        return right.createdAt.getTime() - left.createdAt.getTime();
      default:
        return left.pricePerKgDzd - right.pricePerKgDzd;
    }
  });

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value ?? ""])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Catalogue Produits</h1>
          <p className="text-sm text-muted-foreground">Produits certifiés NFN disponibles à la commande</p>
          <p className="font-mono text-sm text-muted-foreground">{filteredProducts.length} produits disponibles</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/orders">
            <FileText className="h-4 w-4" />
            Voir mes demandes de devis
          </Link>
        </Button>
      </div>

      <ProductFilters />

      <ProductGrid products={pagedProducts} view={view} />

      <div className="flex items-center justify-center gap-2 font-mono text-sm">
        {Array.from({ length: totalPages }).map((_, index) => {
          const nextPage = index + 1;
          const nextQuery = new URLSearchParams(queryString.toString());
          nextQuery.set("page", String(nextPage));

          return (
            <Link
              key={nextPage}
              href={`/catalog?${nextQuery.toString()}`}
              className={nextPage === currentPage ? "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground" : "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground"}
            >
              {nextPage}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
