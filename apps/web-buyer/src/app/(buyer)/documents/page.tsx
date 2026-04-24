import { DocumentCard } from "@/components/buyer/documents/document-card";
import { orders } from "@/lib/mock/orders";
import { FileText, Receipt, ShieldCheck, Globe, Truck, Search } from "lucide-react";

type DocumentsSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const documentTypes = [
  { value: "all", label: "Tous les documents", icon: FileText, color: "text-muted-foreground" },
  { value: "invoice", label: "Factures", icon: Receipt, color: "text-chart-2" },
  { value: "certificate", label: "Certificats NFN", icon: ShieldCheck, color: "text-chart-1" },
  { value: "export", label: "Documents export", icon: Globe, color: "text-chart-3" },
  { value: "delivery", label: "Bons de livraison", icon: Truck, color: "text-chart-4" },
];

export default async function DocumentsPage({ searchParams }: { searchParams: DocumentsSearchParams }) {
  const params = await searchParams;
  const type = getParam(params.type);
  const query = getParam(params.q)?.toLowerCase() ?? "";
  const flatDocuments = orders.flatMap((order) => order.documents);
  const filteredDocuments = flatDocuments.filter((document) => {
    const typeMatch = !type || type === "all" ? true : document.type === type;
    const queryMatch = query ? document.orderId.toLowerCase().includes(query) : true;
    return typeMatch && queryMatch;
  });

  const activeType = type ?? "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Mes Documents</h1>
          <p className="text-sm text-muted-foreground">
            Tous vos documents liés à vos commandes
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            {flatDocuments.length} documents disponibles
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {documentTypes.map((dt) => {
          const Icon = dt.icon;
          const isActive = activeType === dt.value;
          return (
            <a
              key={dt.value}
              href={dt.value === "all" ? "/documents" : `/documents?type=${dt.value}`}
              className={
                isActive
                  ? "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                  : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border/80 hover:bg-accent hover:text-foreground"
              }
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : dt.color}`} />
              {dt.label}
            </a>
          );
        })}
      </div>

      {/* Search bar */}
      <form className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Rechercher par N° commande..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {type && type !== "all" && (
            <input type="hidden" name="type" value={type} />
          )}
        </div>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Filtrer
        </button>
      </form>

      {/* Documents grid */}
      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <FileText className="h-12 w-12 opacity-20" />
          <p className="text-base font-medium text-foreground">Aucun document trouvé</p>
          <p className="text-sm">Essayez de modifier vos filtres</p>
          <a href="/documents" className="text-sm text-primary hover:underline">
            Réinitialiser les filtres
          </a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
}
