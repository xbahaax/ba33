"use client";

import { useState } from "react";
import { createComplaint } from "@/lib/api/buyer-api";
import type { ComplaintType, Order } from "@/lib/types/order";

const complaintTypes: Array<{ value: ComplaintType; label: string }> = [
  { value: "quality", label: "Defaut qualite" },
  { value: "quantity", label: "Ecart de quantite" },
  { value: "delivery", label: "Probleme de livraison" },
  { value: "certificate", label: "Certificat" },
  { value: "other", label: "Autre" },
];

export function ComplaintForm({ orders, selectedOrderId }: { orders: Order[]; selectedOrderId?: string }) {
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  return (
    <form
      className="space-y-8 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmissionError(null);
        const formData = new FormData(event.currentTarget);
        const orderId = String(formData.get("orderId") ?? selectedOrderId ?? orders[0]?.id ?? "");
        const type = String(formData.get("type") ?? "other") as ComplaintType;

        if (!orderId) {
          return;
        }

        try {
          const complaint = await createComplaint({ orderId, type });
          setCreatedComplaintId(complaint.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Impossible de soumettre la réclamation.";
          setSubmissionError(message);
        }
      }}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {["Identification", "Description", "Resolution"].map((label, index) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            <div className={index === 0 ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground" : "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"}>
              {index + 1}
            </div>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Etape 1 — Identification</h2>
        <select name="orderId" defaultValue={selectedOrderId ?? orders[0]?.id} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.id} — {order.placedAt.toLocaleDateString("fr-FR")}
            </option>
          ))}
        </select>
        <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          Commande concernee : {selectedOrderId ?? orders[0]?.id}
        </div>
        <select name="type" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          {complaintTypes.map((complaintType) => (
            <option key={complaintType.value} value={complaintType.value}>
              {complaintType.label}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Etape 2 — Description</h2>
        <textarea rows={6} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Décrivez le problème en détail" />
        <div className="rounded-xl border-2 border-dashed border-border p-5 text-sm text-muted-foreground">
          Zone upload photos / preuves (images + PDF)
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-sm border border-border bg-muted px-2 py-1 text-xs text-foreground">preuve-photo-01.jpg</span>
          <span className="rounded-sm border border-border bg-muted px-2 py-1 text-xs text-foreground">rapport-qualite.pdf</span>
        </div>
        <input type="text" className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm" placeholder="Montant du prejudice estime (optionnel)" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Etape 3 — Resolution souhaitee</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Remplacement produit",
            "Avoir commercial",
            "Remboursement",
            "Autre",
          ].map((option) => (
            <label key={option} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground">
              <input type="radio" name="resolution" />
              {option}
            </label>
          ))}
        </div>
        <textarea rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Précisions additionnelles" />
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" />
          J&apos;accepte que cette réclamation soit transmise aux équipes NFN pour investigation.
        </label>
      </section>

      {createdComplaintId ? (
        <div className="rounded-xl border border-chart-1/30 bg-chart-1/10 p-4 text-center">
          <p className="font-mono font-bold text-foreground">{createdComplaintId}</p>
          <p className="mt-1 text-sm text-muted-foreground">Réclamation transmise à l&apos;API ba33.</p>
        </div>
      ) : null}

      {submissionError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {submissionError}
        </div>
      ) : null}

      <button type="submit" className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm">
        Soumettre la réclamation
      </button>
    </form>
  );
}
