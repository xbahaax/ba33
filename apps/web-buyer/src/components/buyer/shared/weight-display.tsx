export function WeightDisplay({ valueKg }: { valueKg: number }) {
  return (
    <span>
      <span className="font-mono font-semibold text-foreground">{new Intl.NumberFormat("fr-FR").format(valueKg)}</span>
      <span className="ml-1 font-mono text-xs text-muted-foreground">kg</span>
    </span>
  );
}
