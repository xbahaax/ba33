"use client";

import { Trash2 } from "lucide-react";
import type { CartEntry } from "@/lib/cart-store";
import { GradeBadge } from "@/components/buyer/shared/grade-badge";
import { ConfirmActionDialog } from "@/components/buyer/shared/confirm-action-dialog";

export function CartItem({
  item,
  onDecrease,
  onIncrease,
  onDelete,
}: {
  item: CartEntry;
  onDecrease: () => void;
  onIncrease: () => void;
  onDelete: () => void;
}) {
  const lineTotal = item.quantityKg * item.unitPriceDzd;

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs text-muted-foreground">{item.productCode}</p>
          <p className="font-semibold text-foreground">{item.productName}</p>
          <GradeBadge grade={item.grade} />
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-input">
            <button type="button" className="px-3 py-2 text-muted-foreground" onClick={onDecrease}>-</button>
            <span className="min-w-20 border-x border-input px-3 py-2 text-center font-mono text-sm">{item.quantityKg} kg</span>
            <button type="button" className="px-3 py-2 text-muted-foreground" onClick={onIncrease}>+</button>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-mono font-bold text-foreground">{new Intl.NumberFormat("fr-FR").format(lineTotal)} DZD</p>
            <ConfirmActionDialog
              trigger={
                <button type="button" aria-label="Supprimer l'article" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              }
              title="Supprimer cet article"
              description="L'article sera retiré du panier actuel."
              confirmLabel="Supprimer"
              destructive
              onConfirm={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
