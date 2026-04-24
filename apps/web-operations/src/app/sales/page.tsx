import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ba33/ui-web";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { UnavailableState } from "@/components/unavailable-state";
import { getSalesOverview } from "@/lib/api";
import { formatCurrency, formatDateTime, formatEnumLabel } from "@/lib/format";

export default async function SalesPage() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acheteur</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Créée le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.buyerCompanyName ?? "—"}</TableCell>
                  <TableCell>{formatEnumLabel(order.channel)}</TableCell>
                  <TableCell>
                    <StatusBadge value={order.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={order.paymentStatus} />
                  </TableCell>
                  <TableCell>{formatCurrency(order.total, order.currency)}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
