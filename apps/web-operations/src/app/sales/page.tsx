import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ba33/ui-web";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SalesWorkflowPage } from "@/components/sales-workflow-page";
import { StatusBadge } from "@/components/status-badge";
import { UnavailableState } from "@/components/unavailable-state";
import { getSalesOverview } from "@/lib/api";
import { formatCurrency, formatDateTime, formatEnumLabel } from "@/lib/format";

export default function SalesPage() {
  return <SalesWorkflowPage />;
}

void LegacySalesPage;

async function LegacySalesPage() {
  const data = await getSalesOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Ventes"
          description="Commandes, canaux et paiement."
        />
        <UnavailableState message="Le module ventes attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Ventes"
        description="Suivi commercial des commandes nationales, export et institutionnelles."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total commandes" value={data.summary.totalOrders.toString()} />
        <MetricCard label="Ouvertes" value={data.summary.openOrders.toString()} />
        <MetricCard label="Expédiées" value={data.summary.shippedOrders.toString()} />
        <MetricCard label="Livrées" value={data.summary.deliveredOrders.toString()} />
        <MetricCard label="Retours" value={data.summary.returnedOrders.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
          <CardDescription>
            Derniers mouvements du carnet de commandes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Acheteur
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Canal
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Paiement
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Montant
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Créée le
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
              {data.orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">{order.buyerCompanyName ?? "—"}</td>
                  <td className="p-4 align-middle">
                    {formatEnumLabel(order.channel)}
                  </td>
                  <td className="p-4 align-middle">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="p-4 align-middle">
                    <StatusBadge value={order.paymentStatus} />
                  </td>
                  <td className="p-4 align-middle">
                    {formatCurrency(order.total, order.currency)}
                  </td>
                  <td className="p-4 align-middle">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
