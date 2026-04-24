"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@ba33/ui-web";
import type { Product } from "@/lib/types/product";
import { addProductToCart } from "@/lib/cart-store";

export function AddToCartButton({
  product,
  quantityKg = 50,
  size,
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
      className={className}
      onClick={() => {
        addProductToCart(product, quantityKg);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <ShoppingCart className="mr-1.5 h-4 w-4" />
      {added ? "Ajouté" : "Ajouter panier"}
    </Button>
  );
}
