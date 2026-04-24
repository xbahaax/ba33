import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ba33/ui-web";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { UnavailableState } from "@/components/unavailable-state";
import { getRegionsOverview } from "@/lib/api";
import { formatEnumLabel } from "@/lib/format";

export default async function RegionsPage() {
  const data = await getRegionsOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Régions"
          description="Wilayas, communes et villages de référence."
        />
        <UnavailableState message="Le module régions attend l’API backend." />
      </div>
    );
  }

  const wilayas =
    data.summary.typeBreakdown.find((row) => row.type === "wilaya")?.count ?? 0;
  const communes =
    data.summary.typeBreakdown.find((row) => row.type === "commune")?.count ?? 0;
  const villages =
    data.summary.typeBreakdown.find((row) => row.type === "village")?.count ?? 0;

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Régions"
        description="Référentiel administratif pour l’organisation territoriale de la plateforme."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total" value={data.summary.totalRegions.toString()} />
        <MetricCard label="Wilayas" value={wilayas.toString()} />
        <MetricCard label="Communes" value={communes.toString()} />
        <MetricCard label="Villages" value={villages.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Régions enregistrées</CardTitle>
          <CardDescription>
            Extrait du référentiel géographique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Nom
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Parent
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Coordonnées
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
              {data.regions.map((region) => (
                <tr
                  key={region.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">{region.name}</td>
                  <td className="p-4 align-middle font-mono text-xs">{region.code}</td>
                  <td className="p-4 align-middle">{formatEnumLabel(region.type)}</td>
                  <td className="p-4 align-middle">{region.parentId ?? "—"}</td>
                  <td className="p-4 align-middle">
                    {region.latitude && region.longitude
                      ? `${region.latitude}, ${region.longitude}`
                      : "—"}
                  </td>
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
