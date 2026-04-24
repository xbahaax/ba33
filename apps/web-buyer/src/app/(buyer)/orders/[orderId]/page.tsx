import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ba33/ui-web";
import { DocumentCard } from "@/components/buyer/documents/document-card";
import { GradeBadge } from "@/components/buyer/shared/grade-badge";
import { OrderHeaderActions } from "@/components/buyer/orders/order-header-actions";
import { OrderStatusBadge } from "@/components/buyer/orders/order-status-badge";
import { OrderTimeline } from "@/components/buyer/orders/order-timeline";
import { ShipmentTracker } from "@/components/buyer/orders/shipment-tracker";
import { getOrder } from "@/lib/api/buyer-api";
import { requireServerAuthToken } from "@/lib/auth/server-session";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const token = await requireServerAuthToken();
  const order = await getOrder(orderId, token);

  if (!order) {
    return <div className="rounded-xl border border-border bg-card p-6 shadow-xs">Commande introuvable.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Commande <span className="font-mono font-bold text-primary">{order.id}</span>
          </h1>
          <OrderStatusBadge status={order.status} />
          <p className="font-mono text-sm text-muted-foreground">{order.placedAt.toLocaleDateString("fr-FR")}</p>
        </div>
        <OrderHeaderActions orderId={order.id} documents={order.documents} />
      </div>

      <OrderTimeline status={order.status} />
      <ShipmentTracker order={order} />

      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Articles commandés</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code produit</TableHead>
              <TableHead>Désignation</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Prix unitaire</TableHead>
              <TableHead>Total ligne</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell className="font-mono">{item.productCode}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell><GradeBadge grade={item.grade} /></TableCell>
                <TableCell className="font-mono">{item.quantityKg} kg</TableCell>
                <TableCell className="font-mono">{new Intl.NumberFormat("fr-FR").format(item.unitPriceDzd)} DZD</TableCell>
                <TableCell className="font-mono font-bold">{new Intl.NumberFormat("fr-FR").format(item.quantityKg * item.unitPriceDzd)} DZD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Documents liés</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {order.documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-muted p-4">
          <h3 className="font-medium text-foreground">Adresse de livraison</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.shippingAddress.siteName}, {order.shippingAddress.line1}, {order.shippingAddress.commune}, {order.shippingAddress.wilaya}
          </p>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <h3 className="font-medium text-foreground">Mode de paiement</h3>
          <p className="mt-2 text-sm capitalize text-muted-foreground">{order.channel}</p>
        </div>
      </div>
    </div>
  );
}
