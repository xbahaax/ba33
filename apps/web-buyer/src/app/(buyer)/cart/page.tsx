import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { CartItem } from "@/components/buyer/cart/cart-item";
import { CartSummary } from "@/components/buyer/cart/cart-summary";
import { orders } from "@/lib/mock/orders";

const cartItems = [orders[0].items[0], orders[1].items[0]];

export default function CartPage() {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);

  if (cartItems.length === 0) {
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
            <p className="text-sm text-muted-foreground">({cartItems.length} articles)</p>
          </div>
          <Button variant="ghost" className="text-destructive">Vider le panier</Button>
        </div>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>
      </section>

      <CartSummary itemCount={cartItems.length} totalAmountDzd={totalAmount} />
    </div>
  );
}
