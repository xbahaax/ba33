import type { OrderItem, SalesChannel } from "@/lib/types/order";

export function OrderSummaryPanel({ items, channel }: { items: OrderItem[]; channel: SalesChannel }) {
  const total = items.reduce((sum, item) => sum + item.quantityKg * item.unitPriceDzd, 0);
  const currencyLabel = channel === "export" ? "EUR / USD" : "DZD";

  return (
    <aside className="sticky top-20 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold">Votre commande</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-foreground">{item.productName}</p>
              <p className="font-mono text-xs text-muted-foreground">{item.quantityKg} kg</p>
            </div>
            <p className="font-mono">{new Intl.NumberFormat("fr-FR").format(item.quantityKg * item.unitPriceDzd)} DZD</p>
          </div>
        ))}
      </div>
      <div className="my-4 border-t border-border" />
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Canal</span>
          <span className="capitalize text-foreground">{channel}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-bold text-primary">{new Intl.NumberFormat("fr-FR").format(total)} {currencyLabel}</span>
        </div>
      </div>
    </aside>
  );
}
