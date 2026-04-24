import { ComplaintForm } from "@/components/buyer/complaints/complaint-form";
import { orders } from "@/lib/mock/orders";

type ComplaintSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewComplaintPage({ searchParams }: { searchParams: ComplaintSearchParams }) {
  const params = await searchParams;
  const orderId = getParam(params.orderId);

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nouvelle réclamation</h1>
      </div>
      <ComplaintForm orders={orders} selectedOrderId={orderId} />
      <div className="rounded-xl border border-chart-1/30 bg-chart-1/10 p-8 text-center">
        <p className="font-mono font-bold text-foreground">REC-2026-0091</p>
        <p className="mt-2 text-sm text-muted-foreground">Délai de traitement estimé : 5 jours ouvrables</p>
      </div>
    </div>
  );
}
