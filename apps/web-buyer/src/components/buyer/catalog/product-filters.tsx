"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, LayoutGrid, List, X } from "lucide-react";
import { cn } from "@ba33/ui-web/cn";

const productTypes = [
  { value: "all", label: "Tous les types" },
  { value: "P1", label: "P1 — Isolants & Géotextiles" },
  { value: "P2", label: "P2 — Biofertilisants" },
];

const grades = ["A", "B", "C"] as const;
const regions = ["Toutes", "Tiaret", "Djelfa", "Laghouat", "Naama"];
const sortOptions = [
  { value: "Prix croissant", label: "Prix croissant" },
  { value: "Prix decroissant", label: "Prix décroissant" },
  { value: "Grade (A→C)", label: "Grade (A→C)" },
  { value: "Disponibilite", label: "Disponibilité" },
  { value: "Plus recents", label: "Plus récents" },
];

const gradeColors: Record<string, string> = {
  A: "border-chart-1/40 bg-chart-1/15 text-chart-1",
  B: "border-chart-2/40 bg-chart-2/15 text-chart-2",
  C: "border-chart-3/40 bg-chart-3/15 text-chart-3",
};

function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        className="h-9 appearance-none rounded-lg border border-border bg-background pl-3 pr-8 text-sm text-foreground transition-colors hover:border-primary/40 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-lg border px-3 text-sm transition-all duration-150",
        checked
          ? "border-primary/40 bg-primary/10 text-primary font-medium"
          : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
      )}
    >
      {/* Toggle pill */}
      <span className={cn("relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 transition-colors duration-200", checked ? "border-primary bg-primary" : "border-muted-foreground/40 bg-muted")}>
        <span className={cn("absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-background transition-transform duration-200", checked && "translate-x-3")} />
      </span>
      {label}
    </button>
  );
}

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedGrades = (searchParams.get("grade") ?? "").split(",").filter(Boolean);
  const hasActiveFilters = Array.from(searchParams.keys()).filter((k) => k !== "view").length > 0;

  const updateQuery = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || value === "Toutes") {
      next.delete(name);
    } else {
      next.set(name, value);
    }
    router.push(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const toggleGrade = (grade: (typeof grades)[number]) => {
    const nextGrades = selectedGrades.includes(grade)
      ? selectedGrades.filter((item) => item !== grade)
      : [...selectedGrades, grade];
    updateQuery("grade", nextGrades.join(","));
  };

  return (
    <div className="sticky top-16 z-30 border-b border-border bg-background/95 py-3 backdrop-blur-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        {/* Type select */}
        <StyledSelect
          value={searchParams.get("type") ?? "all"}
          onChange={(v) => updateQuery("type", v)}
          options={productTypes}
        />

        {/* Grade toggles */}
        <div className="flex gap-1.5">
          {grades.map((grade) => (
            <button
              key={grade}
              type="button"
              onClick={() => toggleGrade(grade)}
              className={cn(
                "h-9 rounded-lg border px-3 font-mono text-xs font-bold transition-all duration-150",
                selectedGrades.includes(grade)
                  ? gradeColors[grade]
                  : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
              )}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* Region select */}
        <StyledSelect
          value={searchParams.get("region") ?? "Toutes"}
          onChange={(v) => updateQuery("region", v)}
          options={regions.map((r) => ({ value: r, label: r }))}
        />

        {/* Toggle switches */}
        <ToggleSwitch
          checked={searchParams.get("stock") === "1"}
          onChange={(v) => updateQuery("stock", v ? "1" : undefined)}
          label="En stock"
        />
        <ToggleSwitch
          checked={searchParams.get("nfn") === "1"}
          onChange={(v) => updateQuery("nfn", v ? "1" : undefined)}
          label="NFN certifié"
        />

        {/* Sort select */}
        <StyledSelect
          value={searchParams.get("sort") ?? sortOptions[0]!.value}
          onChange={(v) => updateQuery("sort", v)}
          options={sortOptions}
        />

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              const next = new URLSearchParams();
              const view = searchParams.get("view");
              if (view) next.set("view", view);
              router.push(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`);
            }}
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* View toggle */}
        <div className="inline-flex overflow-hidden rounded-lg border border-border bg-background">
          <button
            type="button"
            aria-label="Vue grille"
            className={cn(
              "px-3 py-2 transition-colors",
              searchParams.get("view") !== "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => updateQuery("view", "grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Vue liste"
            className={cn(
              "px-3 py-2 transition-colors",
              searchParams.get("view") === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => updateQuery("view", "list")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
