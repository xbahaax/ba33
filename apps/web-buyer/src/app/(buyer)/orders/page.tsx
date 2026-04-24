import Link from "next/link";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ba33/ui-web";
import { OrderCard } from "@/components/buyer/orders/order-card";
import { OrderStatusBadge } from "@/components/buyer/orders/order-status-badge";
import { getOrders } from "@/lib/api/buyer-api";

type OrdersSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrdersPage({ searchParams }: { searchParams: OrdersSearchParams }) {
  const params = await searchParams;
  const status = getParam(params.status);
  const query = getParam(params.q)?.toLowerCase() ?? "";
  const orders = await getOrders();

  const filteredOrders = orders.filter((order) => {
    const statusMatch = !status || status === "all" ? true : order.status === status;
    const queryMatch = query ? order.id.toLowerCase().includes(query) : true;
    return statusMatch && queryMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Mes Commandes</h1>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row">
          <select name="status" defaultValue={status ?? "all"} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Toutes</option>
            <option value="pending">En cours</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>
          <input name="q" defaultValue={query} placeholder="Chercher par numéro" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <Button>Filtrer</Button>
        </form>
      </div>

      <div className="hidden rounded-xl border border-border bg-card shadow-xs md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Produit(s)</TableHead>
              <TableHead>Quantité totale</TableHead>
              <TableHead>Montant total</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/orders/${order.id}`} className="font-mono text-primary">
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{order.placedAt.toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>{order.items[0]?.productName}{order.items.length > 1 ? ` +${order.items.length - 1} autres` : ""}</TableCell>
                <TableCell className="font-mono font-medium">{new Intl.NumberFormat("fr-FR").format(order.totalQuantityKg)} kg</TableCell>
                <TableCell className="font-mono font-bold">{new Intl.NumberFormat("fr-FR").format(order.totalAmountDzd)} DZD</TableCell>
                <TableCell className="capitalize">{order.channel}</TableCell>
                <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/orders/${order.id}`}>Voir</Link>
                    </Button>
                    <Button size="sm" variant="ghost">Télécharger</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:hidden">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
