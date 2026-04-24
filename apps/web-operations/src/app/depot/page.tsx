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
import { getDepotOverview } from "@/lib/api";
import { formatDateTime, formatPercent, formatWeight } from "@/lib/format";

export default async function DepotPage() {
  const data = await getDepotOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Dépôt"
          description="Réception, stockage, pré-tri et alertes A1."
        />
        <UnavailableState message="Le module dépôt attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Dépôt"
        description="Vision opérationnelle des capacités, réceptions et alertes logistiques."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Dépôts" value={data.summary.totalDepots.toString()} />
        <MetricCard label="Dépôts actifs" value={data.summary.activeDepots.toString()} />
        <MetricCard
          label="Capacité"
          value={formatWeight(data.summary.totalCapacityKg)}
        />
        <MetricCard
          label="Stock courant"
          value={formatWeight(data.summary.currentWeightKg)}
          helper={formatPercent(data.summary.occupancyRate)}
        />
        <MetricCard
          label="Alertes ouvertes"
          value={data.summary.openAlerts.toString()}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dépôts</CardTitle>
          <CardDescription>
            Taux de charge et responsables par site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.depots.map((depot) => (
                <TableRow key={depot.id}>
                  <TableCell className="font-medium">{depot.name}</TableCell>
                  <TableCell>{depot.regionName ?? "—"}</TableCell>
                  <TableCell>{depot.managerName ?? "—"}</TableCell>
                  <TableCell>
                    {formatWeight(depot.currentWeightKg)} / {formatWeight(depot.capacityKg)}
                  </TableCell>
                  <TableCell>{formatPercent(depot.occupancyRate)}</TableCell>
                  <TableCell>
                    <StatusBadge value={depot.active ? "active" : "suspended"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Réceptions récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dépôt</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Écart</TableHead>
                  <TableHead>Reçu le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentReceptions.map((reception) => (
                  <TableRow key={reception.id}>
                    <TableCell>{reception.depotName ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {reception.lotQrCode ?? "—"}
                    </TableCell>
                    <TableCell>{formatWeight(reception.actualWeightKg)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          reception.toleranceExceeded ? "text-destructive" : "text-muted-foreground"
                        }
                      >
                        {formatWeight(reception.discrepancyKg)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDateTime(reception.receivedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes A1</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dépôt</TableHead>
                  <TableHead>Sévérité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Déclenchée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.depotName ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge value={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={alert.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(alert.firedAt)}</TableCell>
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
