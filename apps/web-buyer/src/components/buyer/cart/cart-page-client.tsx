"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { CartItem } from "@/components/buyer/cart/cart-item";
import { CartSummary } from "@/components/buyer/cart/cart-summary";
import { ConfirmActionDialog } from "@/components/buyer/shared/confirm-action-dialog";
import { clearCartEntries, removeCartEntry, updateCartEntryQuantity, useCartEntries } from "@/lib/cart-store";

export function CartPageClient() {
  const items = useCartEntries();
  const totalAmount = items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-xs">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 text-2xl font-semibold text-foreground">Votre panier est vide</h1>
        <Button asChild className="mt-6">
          <Link href="/catalog">Voir le catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[8fr_4fr]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Mon Panier</h1>
            <p className="text-sm text-muted-foreground">({items.length} articles)</p>
          </div>
          <ConfirmActionDialog
            trigger={
              <Button variant="ghost" className="text-destructive" type="button">
                Vider le panier
              </Button>
            }
            title="Vider le panier"
            description="Cette action supprime tous les articles du panier en cours."
            confirmLabel="Vider"
            destructive
            onConfirm={clearCartEntries}
          />
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onDecrease={() => updateCartEntryQuantity(item.productId, Math.max(50, item.quantityKg - 50))}
              onIncrease={() => updateCartEntryQuantity(item.productId, item.quantityKg + 50)}
              onDelete={() => removeCartEntry(item.productId)}
            />
          ))}
        </div>
      </section>

      <CartSummary itemCount={items.length} totalAmountDzd={totalAmount} />
    </div>
  );
}
