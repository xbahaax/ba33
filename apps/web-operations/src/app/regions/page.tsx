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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Coordonnées</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.regions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell className="font-mono text-xs">{region.code}</TableCell>
                  <TableCell>{formatEnumLabel(region.type)}</TableCell>
                  <TableCell>{region.parentId ?? "—"}</TableCell>
                  <TableCell>
                    {region.latitude && region.longitude
                      ? `${region.latitude}, ${region.longitude}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
