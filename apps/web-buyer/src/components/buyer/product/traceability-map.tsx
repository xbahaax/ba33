export function TraceabilityMap({ region }: { region: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-3 space-y-1">
        <h3 className="text-base font-semibold text-card-foreground">Carte de traceabilite</h3>
        <p className="text-sm text-muted-foreground">Wilaya d&apos;origine mise en surbrillance : {region}</p>
      </div>
      <svg viewBox="0 0 420 240" className="w-full rounded-xl bg-muted">
        <path d="M58 88 L118 42 L246 30 L338 80 L358 156 L309 208 L183 210 L92 182 L44 126 Z" fill="color-mix(in oklab, var(--background) 90%, black 10%)" stroke="var(--border)" strokeWidth="3" />
        <path d="M92 92 L142 68 L213 74 L245 112 L231 156 L161 164 L111 142 Z" fill="color-mix(in oklab, var(--chart-1) 30%, transparent)" stroke="var(--chart-1)" strokeWidth="3" />
        <circle cx="171" cy="118" r="6" fill="var(--chart-1)" />
      </svg>
    </div>
  );
}
