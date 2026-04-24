import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ba33/ui-web";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { UnavailableState } from "@/components/unavailable-state";
import { getCertificationOverview } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default async function CertificationPage() {
  const data = await getCertificationOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Certification"
          description="Scellement NFN, émission et révocation."
        />
        <UnavailableState message="Le module certification attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Certification"
        description="Suivi du pipeline d’émission et de contrôle des sceaux NFN."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total dossiers"
          value={data.summary.totalCertifications.toString()}
        />
        <MetricCard label="En attente" value={data.summary.pending.toString()} />
        <MetricCard label="Émis" value={data.summary.issued.toString()} />
        <MetricCard label="Révoqués" value={data.summary.revoked.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certifications récentes</CardTitle>
          <CardDescription>
            Derniers états de certification produits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Produit
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Émis par
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Émis le
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
              {data.certifications.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-mono text-xs">
                    {item.productCode}
                  </td>
                  <td className="p-4 align-middle">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="p-4 align-middle">{item.issuedByName ?? "—"}</td>
                  <td className="p-4 align-middle">{formatDateTime(item.issuedAt)}</td>
                  <td className="p-4 align-middle">{formatDateTime(item.createdAt)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
