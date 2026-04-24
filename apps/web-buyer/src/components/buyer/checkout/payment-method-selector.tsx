import type { SalesChannel } from "@/lib/types/order";

export function PaymentMethodSelector({ channel }: { channel: SalesChannel }) {
  if (channel === "national") {
    return (
      <div className="grid gap-4">
        <PaymentCard title="Virement bancaire" description="Instructions RIB et reference commande." />
        <PaymentCard title="BaridiMob" description="Instructions code et validation mobile." />
      </div>
    );
  }

  if (channel === "export") {
    return (
      <div className="grid gap-4">
        <PaymentCard title="Virement SWIFT" description="Champs SWIFT / IBAN et reference export." />
        <PaymentCard title="Credit documentaire (L/C)" description="Instructions de remise des documents L/C." />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border-2 border-dashed border-border p-5">
      <p className="text-sm font-medium text-foreground">Bon de commande officiel</p>
      <p className="text-sm text-muted-foreground">Zone d&apos;upload pour le bon de commande officiel.</p>
      <input type="text" placeholder="Reference contrat cadre" className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm" />
    </div>
  );
}

function PaymentCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
