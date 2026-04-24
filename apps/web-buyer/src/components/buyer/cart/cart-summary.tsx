import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@ba33/ui-web";

export function CartSummary({ itemCount, totalAmountDzd }: { itemCount: number; totalAmountDzd: number }) {
  return (
    <aside className="sticky top-20 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Recapitulatif</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Sous-total ({itemCount} articles)</span>
          <span className="font-mono">{new Intl.NumberFormat("fr-FR").format(totalAmountDzd)} DZD</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Estimation livraison</span>
          <span className="text-muted-foreground">A calculer selon adresse</span>
        </div>
      </div>
      <div className="my-4 border-t border-border" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Total estime</span>
        <span className="font-mono text-xl font-bold text-primary">{new Intl.NumberFormat("fr-FR").format(totalAmountDzd)} DZD</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">TVA non incluse pour l&apos;export</p>
      <div className="mt-6 space-y-3">
        <Button asChild className="w-full text-base">
          <Link href="/checkout">Passer la commande</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/catalog">Continuer mes achats</Link>
        </Button>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Paiement securise
      </div>
    </aside>
  );
}
