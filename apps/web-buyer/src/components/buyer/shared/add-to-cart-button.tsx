"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { cn } from "@ba33/ui-web/cn";
import type { Product } from "@/lib/types/product";
import { addProductToCart } from "@/lib/cart-store";

export function AddToCartButton({
  product,
  quantityKg = 50,
  size = "sm",
  className,
}: {
  product: Product;
  quantityKg?: number;
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
}) {
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      size={size}
      className={cn("h-9 whitespace-nowrap border border-border px-3 text-xs", className)}
      onClick={() => {
        addProductToCart(product, quantityKg);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <ShoppingCart className="mr-1.5 h-4 w-4" />
      {added ? "Ajouté" : "Ajouter au panier"}
    </Button>
  );
}
