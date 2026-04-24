export type DocumentType = "invoice" | "certificate" | "export" | "delivery";

export interface OrderDocument {
  id: string;
  type: DocumentType;
  title: string;
  orderId: string;
  sizeLabel: string;
  createdAt: Date;
}
