import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { CheckoutSteps } from "@/components/buyer/checkout/checkout-steps";
import { CheckoutAddressSelection } from "@/components/buyer/checkout/checkout-address-selection";
import { OrderSummaryPanel } from "@/components/buyer/checkout/order-summary-panel";
import { PaymentMethodSelector } from "@/components/buyer/checkout/payment-method-selector";
import { getAddresses, getOrders } from "@/lib/api/buyer-api";
import type { SalesChannel } from "@/lib/types/order";

type CheckoutSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({ searchParams }: { searchParams: CheckoutSearchParams }) {
  const params = await searchParams;
  const step = Math.max(1, Math.min(3, Number(getParam(params.step) ?? "1"))) as 1 | 2 | 3;
  const channel = ((getParam(params.channel) ?? "national") as SalesChannel);
  const [addresses, orders] = await Promise.all([getAddresses(), getOrders()]);
  const items = orders[1].items;

  return (
    <div className="space-y-6">
      <CheckoutSteps step={step} />

      <div className="grid gap-6 xl:grid-cols-[7fr_5fr]">
        <section className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
              <CheckoutAddressSelection initialAddresses={addresses} />

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Canal de vente</h2>
                <div className="space-y-3">
                  {[
                    { value: "national", label: "🇩🇿 National", description: "Facturation DZD, virement bancaire ou BaridiMob" },
                    { value: "export", label: "🌍 Export", description: "Facturation EUR/USD, SWIFT, crédit documentaire" },
                    { value: "institutional", label: "🏛 Institutionnel", description: "Contrat cadre, bon de commande officiel requis" },
                  ].map((option) => (
                    <Link
                      key={option.value}
                      href={`/checkout?step=1&channel=${option.value}`}
                      className={channel === option.value ? "block rounded-xl border-2 border-primary bg-primary/5 p-4" : "block rounded-xl border border-border bg-accent/30 p-4 hover:bg-accent/50"}
                    >
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Instructions spéciales</label>
                <textarea className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Instructions de livraison, référence acheteur..." />
              </div>

              <Button asChild className="w-full">
                <Link href={`/checkout?step=2&channel=${channel}`}>Continuer vers paiement</Link>
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-foreground">Paiement</h1>
                <p className="text-sm text-muted-foreground">Mode de paiement selon le canal sélectionné.</p>
              </div>
              <PaymentMethodSelector channel={channel} />
              <div className="flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/checkout?step=1&channel=${channel}`}>Retour</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/checkout?step=3&channel=${channel}`}>Continuer</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="rounded-xl border border-chart-1/30 bg-chart-1/10 p-8 text-center">
              <CheckCircle className="mx-auto h-14 w-14 text-chart-1" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">Commande confirmée !</h1>
              <p className="mt-3 font-mono font-bold text-primary">CMD-2026-00999</p>
              <p className="mt-2 text-sm text-muted-foreground">Vous recevrez un email de confirmation à contact@nourafibres.dz</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/orders/CMD-2026-00142">Suivre ma commande</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/catalog">Continuer mes achats</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <OrderSummaryPanel items={items} channel={channel} />
      </div>
    </div>
  );
}
