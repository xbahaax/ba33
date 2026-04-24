import { AlertTriangle, CheckCircle, Clock, Package, PackageCheck, Truck, XCircle } from "lucide-react";
import type { OrderStatus } from "@/lib/types/order";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    className: string;
    icon: typeof Clock;
  }
> = {
  pending: { label: "En attente confirmation", className: "bg-muted text-muted-foreground", icon: Clock },
  confirmed: { label: "Confirmee", className: "bg-chart-2/15 text-chart-2", icon: CheckCircle },
  preparing: { label: "En preparation", className: "bg-chart-3/15 text-chart-3", icon: Package },
  shipped: { label: "Expediee", className: "bg-chart-4/15 text-chart-4", icon: Truck },
  delivered: { label: "Livree", className: "bg-chart-1/15 text-chart-1", icon: PackageCheck },
  cancelled: { label: "Annulee", className: "bg-destructive/15 text-destructive", icon: XCircle },
  disputed: { label: "Litige", className: "bg-destructive/15 text-destructive", icon: AlertTriangle },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className, icon: Icon } = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
