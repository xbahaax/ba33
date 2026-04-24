"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, FileDown } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { downloadTextFile } from "@/lib/download-file";
import { getOrderDocumentText } from "@/lib/api/buyer-api";
import type { OrderDocument } from "@/lib/types/document";

export function OrderHeaderActions({ orderId, documents }: { orderId: string; documents: OrderDocument[] }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const invoiceDoc = documents.find((doc) => doc.type === "invoice");

  const handleDownloadInvoice = async () => {
    if (!invoiceDoc) return;
    setIsDownloading(true);
    try {
      const content = await getOrderDocumentText(orderId, invoiceDoc.id);
      downloadTextFile(`${orderId}-facture.txt`, content);
    } catch {
      downloadTextFile(`${orderId}-facture.txt`, `Facture\nCommande: ${orderId}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="button" disabled={isDownloading || !invoiceDoc} onClick={handleDownloadInvoice}>
        <FileDown className="h-4 w-4" />
        {isDownloading ? "Téléchargement..." : "Télécharger la facture"}
      </Button>
      <Button asChild variant="outline">
        <Link href={`/complaints/new?orderId=${orderId}`}>
          <AlertCircle className="h-4 w-4" />
          Soumettre une réclamation
        </Link>
      </Button>
    </div>
  );
}
