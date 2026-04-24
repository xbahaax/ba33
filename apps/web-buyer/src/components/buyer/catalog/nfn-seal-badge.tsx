import { ShieldCheck, ShieldOff } from "lucide-react";
import type { NfnSealStatus } from "@/lib/types/product";

export function NfnSealBadge({ status }: { status: NfnSealStatus }) {
  if (status === "certified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
        <ShieldCheck className="h-3 w-3" />
        NFN Certifié
      </span>
    );
  }

  if (status === "revoked") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        <ShieldOff className="h-3 w-3" />
        NFN Révoqué
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      NFN En attente
    </span>
  );
}
