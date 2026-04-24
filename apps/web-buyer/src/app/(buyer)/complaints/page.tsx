import Link from "next/link";
import { Plus, Clock, CheckCircle, XCircle, MessageSquareWarning, AlertCircle } from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ba33/ui-web";
import { complaints } from "@/lib/mock/orders";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  review: {
    label: "En cours d'examen",
    className: "bg-chart-3/15 text-chart-3",
    icon: Clock,
  },
  resolved: {
    label: "Résolue",
    className: "bg-chart-1/15 text-chart-1",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejetée",
    className: "bg-destructive/15 text-destructive",
    icon: XCircle,
  },
};

const typeLabels: Record<string, string> = {
  delivery: "Problème de livraison",
  quantity: "Écart de quantité",
  quality: "Non-conformité qualité",
  other: "Autre",
};

export default function ComplaintsPage() {
  const inReview = complaints.filter((c) => c.status === "review").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Mes Réclamations</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos réclamations liées à vos commandes
          </p>
        </div>
        <Button asChild>
          <Link href="/complaints/new">
            <Plus className="h-4 w-4" />
            Nouvelle réclamation
          </Link>
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="mt-1 font-mono text-2xl font-bold text-foreground">{complaints.length}</p>
          <p className="text-xs text-muted-foreground">réclamations</p>
        </div>
        <div className="rounded-xl border border-chart-3/30 bg-chart-3/5 p-4">
          <p className="font-mono text-xs text-chart-3 uppercase tracking-wider">En examen</p>
          <p className="mt-1 font-mono text-2xl font-bold text-chart-3">{inReview}</p>
          <p className="text-xs text-muted-foreground">en cours de traitement</p>
        </div>
        <div className="rounded-xl border border-chart-1/30 bg-chart-1/5 p-4">
          <p className="font-mono text-xs text-chart-1 uppercase tracking-wider">Résolues</p>
          <p className="mt-1 font-mono text-2xl font-bold text-chart-1">
            {complaints.filter((c) => c.status === "resolved").length}
          </p>
          <p className="text-xs text-muted-foreground">traitées avec succès</p>
        </div>
      </div>

      {/* Info banner if active complaints */}
      {inReview > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-chart-3/30 bg-chart-3/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-chart-3" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {inReview} réclamation{inReview > 1 ? "s" : ""} en cours d&apos;examen
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Notre équipe traite vos réclamations sous 5 jours ouvrables
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <MessageSquareWarning className="h-12 w-12 opacity-20" />
          <p className="text-base font-medium text-foreground">Aucune réclamation</p>
          <p className="text-sm">Vos réclamations apparaîtront ici</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° réclamation</TableHead>
                <TableHead>N° commande</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date soumission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => {
                const status = statusConfig[complaint.status];
                const StatusIcon = status?.icon ?? Clock;
                return (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-mono text-sm text-primary">{complaint.id}</TableCell>
                    <TableCell>
                      <Link href={`/orders/${complaint.orderId}`} className="font-mono text-sm text-foreground hover:text-primary transition-colors">
                        {complaint.orderId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {typeLabels[complaint.type] ?? complaint.type}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {complaint.submittedAt.toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs font-semibold ${status?.className ?? "bg-muted text-muted-foreground"}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status?.label ?? complaint.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Voir détail</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
