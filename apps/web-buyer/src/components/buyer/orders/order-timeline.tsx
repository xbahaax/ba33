import type { OrderStatus } from "@/lib/types/order";

const orderedStatuses: Array<{ key: OrderStatus | "placed"; label: string }> = [
  { key: "placed", label: "Commande placee" },
  { key: "confirmed", label: "Confirmation vendeur" },
  { key: "preparing", label: "En preparation" },
  { key: "shipped", label: "Expediee" },
  { key: "delivered", label: "Livree" },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
  disputed: 3,
};

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = statusIndex[status];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {orderedStatuses.map((item, index) => {
          const state = index < activeIndex ? "past" : index === activeIndex ? "active" : "future";

          return (
            <div key={item.key} className="flex flex-1 items-start gap-3 md:flex-col md:items-center md:text-center">
              <div className={state === "past" ? "flex h-10 w-10 items-center justify-center rounded-full bg-chart-1 text-primary-foreground" : state === "active" ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse" : "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"}>
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className={state === "future" ? "text-sm text-muted-foreground" : "text-sm font-medium text-foreground"}>{item.label}</p>
                <p className="font-mono text-xs text-muted-foreground">{state === "future" ? "—" : "12/03/2026 09:30"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
