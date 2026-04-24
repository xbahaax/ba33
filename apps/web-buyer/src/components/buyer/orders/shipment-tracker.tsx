import { Copy, Thermometer, Truck } from "lucide-react";
import type { Order } from "@/lib/types/order";
import { OrderStatusBadge } from "@/components/buyer/orders/order-status-badge";

export function ShipmentTracker({ order }: { order: Order }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Suivi d&apos;expedition</h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">N° tracking</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono font-bold text-primary">{order.trackingNumber ?? "—"}</span>
              <button type="button" aria-label="Copier le tracking" className="text-muted-foreground">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TrackerInfo label="Transporteur" value="ba33 logistics" />
            <TrackerInfo label="ETA" value={order.estimatedDelivery ? order.estimatedDelivery.toLocaleDateString("fr-FR") : "—"} mono />
          </div>
          <div className="space-y-2 rounded-xl bg-muted p-4">
            <p className="text-sm font-medium text-foreground">Etapes de livraison</p>
            <p className="text-sm text-muted-foreground">Depart entrepot → En transit → Arrivee region → Livre</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="h-4 w-4" />
            4°C a 7°C pour les lots C2
          </div>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Truck className="h-4 w-4" />
            Carte de suivi simulee
          </div>
          <svg viewBox="0 0 360 200" className="w-full rounded-xl bg-background">
            <rect x="18" y="18" width="324" height="164" rx="18" fill="color-mix(in oklab, var(--background) 92%, black 8%)" stroke="var(--border)" />
            <circle cx="92" cy="86" r="8" fill="var(--chart-3)" />
            <circle cx="264" cy="126" r="8" fill="var(--chart-1)" />
            <path d="M92 86 C140 62, 202 124, 264 126" stroke="var(--chart-4)" strokeWidth="4" fill="none" strokeDasharray="7 7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function TrackerInfo({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={mono ? "mt-1 font-mono font-medium text-foreground" : "mt-1 font-medium text-foreground"}>{value}</p>
    </div>
  );
}
