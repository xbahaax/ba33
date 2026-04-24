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
import { getTransformationOverview } from "@/lib/api";
import { formatDateTime, formatEnumLabel, formatWeight } from "@/lib/format";

export default async function TransformationPage() {
  const data = await getTransformationOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Transformation"
          description="Production D3/D4 et suivi des produits."
        />
        <UnavailableState message="Le module transformation attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Transformation"
        description="Pilotage des transformateurs, runs de production et produits sortants."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Transformateurs"
          value={data.summary.totalTransformers.toString()}
        />
        <MetricCard
          label="Sites actifs"
          value={data.summary.activeTransformers.toString()}
        />
        <MetricCard label="Runs actifs" value={data.summary.activeRuns.toString()} />
        <MetricCard label="Runs totaux" value={data.summary.totalRuns.toString()} />
        <MetricCard
          label="Produits récents"
          value={data.summary.recentProducts.toString()}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Runs actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Entrée</TableHead>
                  <TableHead>Sortie</TableHead>
                  <TableHead>Opérateur</TableHead>
                  <TableHead>Démarré</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activeRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{run.transformerName ?? "—"}</TableCell>
                    <TableCell>{formatWeight(run.inputWeightKg)}</TableCell>
                    <TableCell>
                      {run.outputWeightKg ? formatWeight(run.outputWeightKg) : "—"}
                    </TableCell>
                    <TableCell>{run.operatorName ?? "—"}</TableCell>
                    <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produits récents</CardTitle>
            <CardDescription>
              Dernières sorties des pistes D3 et D4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Piste</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">
                      {product.productCode}
                    </TableCell>
                    <TableCell>{formatEnumLabel(product.track)}</TableCell>
                    <TableCell>{product.productTypeCode}</TableCell>
                    <TableCell>{formatWeight(product.weightKg)}</TableCell>
                    <TableCell>
                      <StatusBadge value={product.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
