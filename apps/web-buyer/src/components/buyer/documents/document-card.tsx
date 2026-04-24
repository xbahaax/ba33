"use client";

import { Download, Globe, Receipt, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@ba33/ui-web";
import type { OrderDocument } from "@/lib/types/document";
import { DocumentPreviewModal } from "@/components/buyer/documents/document-preview-modal";
import { downloadTextFile } from "@/lib/download-file";

const iconConfig: Record<string, { icon: React.ElementType; colorClass: string; bgClass: string; label: string }> = {
  invoice: { icon: Receipt, colorClass: "text-chart-2", bgClass: "bg-chart-2/10", label: "Facture" },
  certificate: { icon: ShieldCheck, colorClass: "text-chart-1", bgClass: "bg-chart-1/10", label: "Certificat NFN" },
  export: { icon: Globe, colorClass: "text-chart-3", bgClass: "bg-chart-3/10", label: "Document Export" },
  delivery: { icon: Truck, colorClass: "text-chart-4", bgClass: "bg-chart-4/10", label: "Bon de livraison" },
};

export function DocumentCard({ document }: { document: OrderDocument }) {
  const config = iconConfig[document.type] ?? iconConfig.invoice!;
  const Icon = config.icon;

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20">
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bgClass}`}>
          <Icon className={`h-5 w-5 ${config.colorClass}`} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {/* Type label */}
          <span className={`inline-block rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${config.bgClass} ${config.colorClass}`}>
            {config.label}
          </span>
          {/* Title */}
          <p className="text-sm font-semibold leading-snug text-card-foreground">
            {document.title}
          </p>
          {/* Order ref */}
          <p className="font-mono text-xs text-primary">{document.orderId}</p>
          {/* Meta */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="font-mono">{document.createdAt.toLocaleDateString("fr-FR")}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="font-mono">{document.sizeLabel}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <DocumentPreviewModal title={document.title} />
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          type="button"
          onClick={() => downloadTextFile(`${document.id}.txt`, `${document.title}\nCommande: ${document.orderId}`)}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Télécharger
        </Button>
      </div>
    </article>
  );
}
