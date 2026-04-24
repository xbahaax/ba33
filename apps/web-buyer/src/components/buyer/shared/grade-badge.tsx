import type { ProductGrade } from "@/lib/types/product";

// With simplified palette (single dark green), all grades use the same primary color
// Differentiation is done via border style and opacity
const gradeStyles: Record<ProductGrade, { className: string; label: string }> = {
  A: { className: "bg-primary/15 text-primary border-primary/40", label: "Grade A" },
  B: { className: "bg-foreground/8 text-foreground border-foreground/20", label: "Grade B" },
  C: { className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30", label: "Grade C" },
};

export function GradeBadge({ grade }: { grade: ProductGrade }) {
  const style = gradeStyles[grade];
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-xs font-bold ${style.className}`}
    >
      {style.label}
    </span>
  );
}
