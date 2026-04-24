import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Émis par</TableHead>
                <TableHead>Émis le</TableHead>
                <TableHead>Créé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.certifications.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.productCode}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={item.status} />
                  </TableCell>
                  <TableCell>{item.issuedByName ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(item.issuedAt)}</TableCell>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
