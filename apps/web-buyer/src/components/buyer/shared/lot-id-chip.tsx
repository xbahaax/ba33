export function LotIdChip({ lotId }: { lotId: string }) {
  return (
    <span className="inline-flex cursor-pointer items-center rounded-sm border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary hover:bg-primary/20">
      {lotId}
    </span>
  );
}
