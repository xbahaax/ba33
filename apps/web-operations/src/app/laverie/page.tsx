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
import { getLaverieOverview } from "@/lib/api";
import { formatDateTime, formatNumber, formatWeight } from "@/lib/format";

export default async function LaveriePage() {
  const data = await getLaverieOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Laverie"
          description="Ligne de lavage, contrôles et qualification."
        />
        <UnavailableState message="Le module laverie attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Laverie"
        description="Suivi des installations, cycles actifs et qualifications récentes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Laveries" value={data.summary.totalLaveries.toString()} />
        <MetricCard
          label="Laveries actives"
          value={data.summary.activeLaveries.toString()}
        />
        <MetricCard label="Cycles actifs" value={data.summary.activeRuns.toString()} />
        <MetricCard
          label="Cycles totaux"
          value={data.summary.totalWashRuns.toString()}
        />
        <MetricCard label="Lots qualifiés" value={data.summary.gradedLots.toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cycles actifs</CardTitle>
            <CardDescription>
              Lavages en cours sur les installations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laverie</TableHead>
                  <TableHead>Poids entrant</TableHead>
                  <TableHead>Eau</TableHead>
                  <TableHead>Température</TableHead>
                  <TableHead>Démarré</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activeRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{run.laverieName ?? "—"}</TableCell>
                    <TableCell>{formatWeight(run.dirtyWeightKg)}</TableCell>
                    <TableCell>
                      {run.waterLiters ? `${formatNumber(run.waterLiters)} L` : "—"}
                    </TableCell>
                    <TableCell>{run.waterTempC ? `${run.waterTempC}°C` : "—"}</TableCell>
                    <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualifications récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade</TableHead>
                  <TableHead>Sécurité</TableHead>
                  <TableHead>Longueur fibre</TableHead>
                  <TableHead>Diamètre</TableHead>
                  <TableHead>Daté</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentQualifications.map((qualification) => (
                  <TableRow key={qualification.id}>
                    <TableCell className="font-medium">{qualification.grade}</TableCell>
                    <TableCell>
                      <StatusBadge value={qualification.safetyStatus} />
                    </TableCell>
                    <TableCell>
                      {qualification.fiberLengthMm
                        ? `${qualification.fiberLengthMm} mm`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {qualification.fiberDiameterMicron
                        ? `${qualification.fiberDiameterMicron} µm`
                        : "—"}
                    </TableCell>
                    <TableCell>{formatDateTime(qualification.performedAt)}</TableCell>
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
