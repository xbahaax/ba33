"use client";

import Link from "next/link";
import { AlertCircle, FileDown } from "lucide-react";
import { Button } from "@ba33/ui-web";
import { downloadTextFile } from "@/lib/download-file";

export function OrderHeaderActions({ orderId }: { orderId: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        onClick={() => downloadTextFile(`${orderId}-facture.txt`, `Facture\nCommande: ${orderId}\nDocument statique frontend.`)}
      >
        <FileDown className="h-4 w-4" />
        Télécharger la facture
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
