"use client";

import { Star } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import type { QualityParameters } from "@/lib/types/product";
import { LotIdChip } from "@/components/buyer/shared/lot-id-chip";

export function QualityParameters({ qualityParameters }: { qualityParameters: QualityParameters }) {
  const chartData = [
    { label: "Longueur", value: qualityParameters.fiberLengthMm },
    { label: "Diametre", value: qualityParameters.fiberDiameterMicrons },
    { label: "Humidite", value: qualityParameters.moisturePercent },
    { label: "R1", value: qualityParameters.washingYieldR1Percent },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ParameterCard label="Longueur fibre" value={`${qualityParameters.fiberLengthMm} mm`} />
        <ParameterCard label="Diametre" value={`${qualityParameters.fiberDiameterMicrons} microns`} />
        <ParameterCard label="Teneur en humidite" value={`${qualityParameters.moisturePercent}%`} />
        <ParameterCard label="Rendement au lavage (R1)" value={`${qualityParameters.washingYieldR1Percent}%`} />
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Couleur</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-chart-2/50" />
            <span className="font-medium text-foreground">{qualityParameters.colorDescription}</span>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Note de proprete</p>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={index < qualityParameters.cleanlinessScore ? "h-4 w-4 fill-chart-2 text-chart-2" : "h-4 w-4 text-muted-foreground"}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-3">
        <p className="text-xs text-muted-foreground">Lot source</p>
        <div className="mt-2">
          <LotIdChip lotId={qualityParameters.sourceLotId} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs">
        <p className="mb-3 text-sm font-medium">Traceability quality snapshot</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ParameterCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono font-bold text-foreground">{value}</p>
    </div>
  );
}
