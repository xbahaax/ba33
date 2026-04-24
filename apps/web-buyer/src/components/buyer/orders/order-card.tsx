import Link from "next/link";
import { Button } from "@ba33/ui-web";
import type { Order } from "@/lib/types/order";
import { OrderStatusBadge } from "@/components/buyer/orders/order-status-badge";

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-primary">{order.id}</p>
          <p className="mt-1 text-sm text-muted-foreground">{order.items[0]?.productName}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <p className="font-mono">{new Intl.NumberFormat("fr-FR").format(order.totalQuantityKg)} kg</p>
        <p className="font-mono font-bold">{new Intl.NumberFormat("fr-FR").format(order.totalAmountDzd)} DZD</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">{order.placedAt.toLocaleDateString("fr-FR")}</p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/orders/${order.id}`}>Voir detail</Link>
        </Button>
      </div>
    </article>
  );
}
