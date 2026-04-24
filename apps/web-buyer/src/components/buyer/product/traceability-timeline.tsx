"use client";

import { CircleDot, Droplets, Factory, ShieldCheck, Truck, Warehouse } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import type { TraceabilityChain } from "@/lib/types/traceability";

const eventConfig = [
  { key: "collection", label: "Collecte", icon: CircleDot, colorClass: "text-chart-1", fill: "var(--chart-1)" },
  { key: "depot", label: "Depot D1", icon: Warehouse, colorClass: "text-chart-2", fill: "var(--chart-2)" },
  { key: "transport", label: "Transport", icon: Truck, colorClass: "text-chart-3", fill: "var(--chart-3)" },
  { key: "laverie", label: "Laverie D2", icon: Droplets, colorClass: "text-chart-4", fill: "var(--chart-4)" },
  { key: "transformation", label: "Transformation", icon: Factory, colorClass: "text-chart-5", fill: "var(--chart-5)" },
  { key: "certification", label: "Certification NFN", icon: ShieldCheck, colorClass: "text-primary", fill: "var(--ring)" },
];

export function TraceabilityTimeline({ traceability }: { traceability: TraceabilityChain }) {
  const items = [
    {
      title: "Collecte",
      date: traceability.collectionEvent.collectedAt,
      description: `${traceability.collectionEvent.sourceType}, ${traceability.collectionEvent.commune}, ${traceability.collectionEvent.region}`,
      meta: `${new Intl.NumberFormat("fr-FR").format(traceability.collectionEvent.declaredWeightKg)} kg brut declare`,
      status: "Valide",
      colorClass: eventConfig[0].colorClass,
      icon: eventConfig[0].icon,
    },
    {
      title: "Depot D1",
      date: traceability.depotD1Event.receivedAt,
      description: traceability.depotD1Event.siteName,
      meta: `${new Intl.NumberFormat("fr-FR").format(traceability.depotD1Event.weighedWeightKg)} kg pese, ecart ${traceability.depotD1Event.varianceKg} kg`,
      status: "Valide",
      colorClass: eventConfig[1].colorClass,
      icon: eventConfig[1].icon,
    },
    {
      title: "Transport",
      date: traceability.transportEvent.departedAt,
      description: `${traceability.transportEvent.origin} → ${traceability.transportEvent.destination}`,
      meta: `${traceability.transportEvent.distanceKm} km${traceability.transportEvent.coldChainRequired ? ", chaine du froid C2" : ""}`,
      status: "Valide",
      colorClass: eventConfig[2].colorClass,
      icon: eventConfig[2].icon,
    },
    {
      title: "Laverie D2",
      date: traceability.laverieD2Event.processedAt,
      description: traceability.laverieD2Event.siteName,
      meta: `${traceability.laverieD2Event.dirtyWeightKg} kg → ${traceability.laverieD2Event.cleanWeightKg} kg, rendement ${traceability.laverieD2Event.yieldPercent}%`,
      status: "Valide",
      colorClass: eventConfig[3].colorClass,
      icon: eventConfig[3].icon,
    },
    {
      title: "Transformation",
      date: traceability.transformationEvent.processedAt,
      description: `${traceability.transformationEvent.siteName}, batch ${traceability.transformationEvent.batchNumber}`,
      meta: `${traceability.transformationEvent.inputWeightKg} kg → ${traceability.transformationEvent.outputWeightKg} kg`,
      status: "Valide",
      colorClass: eventConfig[4].colorClass,
      icon: eventConfig[4].icon,
    },
    {
      title: "Certification NFN",
      date: traceability.certificationEvent.certifiedAt,
      description: traceability.certificationEvent.sealCode,
      meta: traceability.certificationEvent.signatureSnippet,
      status: "Valide",
      colorClass: eventConfig[5].colorClass,
      icon: eventConfig[5].icon,
    },
  ];

  const chartData = [
    { step: "Collecte", weight: traceability.collectionEvent.declaredWeightKg },
    { step: "Depot D1", weight: traceability.depotD1Event.weighedWeightKg },
    { step: "Laverie D2", weight: traceability.laverieD2Event.cleanWeightKg },
    { step: "Transformation", weight: traceability.transformationEvent.outputWeightKg },
  ];

  return (
    <section className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Traçabilite Complete</h2>
        <p className="text-sm text-muted-foreground">De la brebis au produit — verifiable, immuable</p>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="relative flex gap-4 pl-2">
              {index < items.length - 1 ? <div className="absolute left-[18px] top-10 h-[calc(100%-10px)] w-px bg-border" /> : null}
              <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted ${item.colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.date.toLocaleDateString("fr-FR")} {item.date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="font-mono text-xs text-muted-foreground">{item.meta}</p>
                <p className="text-sm text-chart-1">✓ {item.status}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-muted p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Flux de poids</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <XAxis dataKey="step" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="weight" stroke="var(--chart-1)" fill="color-mix(in oklab, var(--chart-1) 22%, transparent)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
