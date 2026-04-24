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
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Site
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Entrée
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Sortie
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Opérateur
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Démarré
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {data.activeRuns.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{run.transformerName ?? "—"}</td>
                    <td className="p-4 align-middle">
                      {formatWeight(run.inputWeightKg)}
                    </td>
                    <td className="p-4 align-middle">
                      {run.outputWeightKg ? formatWeight(run.outputWeightKg) : "—"}
                    </td>
                    <td className="p-4 align-middle">{run.operatorName ?? "—"}</td>
                    <td className="p-4 align-middle">{formatDateTime(run.startedAt)}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
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
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Code
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Piste
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Poids
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {data.recentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-mono text-xs">
                      {product.productCode}
                    </td>
                    <td className="p-4 align-middle">{formatEnumLabel(product.track)}</td>
                    <td className="p-4 align-middle">{product.productTypeCode}</td>
                    <td className="p-4 align-middle">{formatWeight(product.weightKg)}</td>
                    <td className="p-4 align-middle">
                      <StatusBadge value={product.status} />
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
