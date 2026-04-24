import { Check } from "lucide-react";

const checkoutSteps = ["Livraison", "Paiement", "Confirmation"];

export function CheckoutSteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
      {checkoutSteps.map((label, index) => {
        const current = index + 1;
        const state = current < step ? "completed" : current === step ? "active" : "future";

        return (
          <div key={label} className="flex flex-1 items-center gap-3">
            <div className={state === "completed" ? "flex h-10 w-10 items-center justify-center rounded-full bg-chart-1 text-primary-foreground" : state === "active" ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground" : "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground"}>
              {state === "completed" ? <Check className="h-4 w-4" /> : current}
            </div>
            <span className={state === "future" ? "text-sm text-muted-foreground" : "text-sm font-medium text-foreground"}>{label}</span>
            {index < checkoutSteps.length - 1 ? <div className={current < step ? "hidden h-px flex-1 bg-chart-1 md:block" : "hidden h-px flex-1 bg-border md:block"} /> : null}
          </div>
        );
      })}
    </div>
  );
}
