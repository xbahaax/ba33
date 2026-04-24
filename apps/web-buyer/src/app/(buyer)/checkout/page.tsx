"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { CheckoutSteps } from "@/components/buyer/checkout/checkout-steps";
import { CheckoutAddressSelection } from "@/components/buyer/checkout/checkout-address-selection";
import { OrderSummaryPanel } from "@/components/buyer/checkout/order-summary-panel";
import { PaymentMethodSelector } from "@/components/buyer/checkout/payment-method-selector";
import { createOrder, getAddresses, createAddress } from "@/lib/api/buyer-api";
import { useCartEntries, clearCartEntries } from "@/lib/cart-store";
import type { Address, SalesChannel } from "@/lib/types/order";

export default function CheckoutPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [channel, setChannel] = useState<SalesChannel>("national");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartItems = useCartEntries();

  useEffect(() => {
    getAddresses()
      .then((addrs) => {
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      })
      .catch(() => {});
  }, []);

  const cartAsOrderItems = cartItems.map((entry) => ({
    productId: entry.productId,
    productCode: entry.productCode,
    productName: entry.productName,
    grade: entry.grade,
    quantityKg: entry.quantityKg,
    unitPriceDzd: entry.unitPriceDzd,
  }));

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        channel,
        items: cartAsOrderItems,
        shippingAddressId: selectedAddressId || undefined,
      });
      clearCartEntries();
      setCreatedOrderId(order.id);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressCreated = async (draft: Omit<Address, "id" | "isDefault">) => {
    try {
      const created = await createAddress(draft);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      return created;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <CheckoutSteps step={step} />

      <div className="grid gap-6 xl:grid-cols-[7fr_5fr]">
        <section className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
              <CheckoutAddressSelection
                addressList={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onAddressCreated={handleAddressCreated}
              />

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Canal de vente</h2>
                <div className="space-y-3">
                  {(
                    [
                      { value: "national" as SalesChannel, label: "🇩🇿 National", description: "Facturation DZD, virement bancaire ou BaridiMob" },
                      { value: "export" as SalesChannel, label: "🌍 Export", description: "Facturation EUR/USD, SWIFT, crédit documentaire" },
                      { value: "institutional" as SalesChannel, label: "🏛 Institutionnel", description: "Contrat cadre, bon de commande officiel requis" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setChannel(option.value)}
                      className={
                        channel === option.value
                          ? "block w-full rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                          : "block w-full rounded-xl border border-border bg-accent/30 p-4 text-left hover:bg-accent/50"
                      }
                    >
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Instructions spéciales</label>
                <textarea
                  className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Instructions de livraison, référence acheteur..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button type="button" className="w-full" onClick={() => setStep(2)}>
                Continuer vers paiement
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
              {error ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
              ) : null}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button type="button" className="flex-1" disabled={isSubmitting} onClick={handleConfirmOrder}>
                  {isSubmitting ? "Traitement..." : "Confirmer la commande"}
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="rounded-xl border border-chart-1/30 bg-chart-1/10 p-8 text-center">
              <CheckCircle className="mx-auto h-14 w-14 text-chart-1" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">Commande confirmée !</h1>
              <p className="mt-3 font-mono font-bold text-primary">{createdOrderId}</p>
              <p className="mt-2 text-sm text-muted-foreground">Votre commande a été transmise avec succès.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href={`/orders/${createdOrderId}`}>Suivre ma commande</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/catalog">Continuer mes achats</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <OrderSummaryPanel items={cartAsOrderItems} channel={channel} />
      </div>
    </div>
  );
}
