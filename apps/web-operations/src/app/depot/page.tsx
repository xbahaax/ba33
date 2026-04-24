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
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Nom
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Région
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Responsable
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Occupation
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    État
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
              {data.depots.map((depot) => (
                <tr
                  key={depot.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">{depot.name}</td>
                  <td className="p-4 align-middle">{depot.regionName ?? "—"}</td>
                  <td className="p-4 align-middle">{depot.managerName ?? "—"}</td>
                  <td className="p-4 align-middle">
                    {formatWeight(depot.currentWeightKg)} / {formatWeight(depot.capacityKg)}
                  </td>
                  <td className="p-4 align-middle">
                    {formatPercent(depot.occupancyRate)}
                  </td>
                  <td className="p-4 align-middle">
                    <StatusBadge value={depot.active ? "active" : "suspended"} />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Réceptions récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Dépôt
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Lot
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Poids
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Écart
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Reçu le
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {data.recentReceptions.map((reception) => (
                  <tr
                    key={reception.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{reception.depotName ?? "—"}</td>
                    <td className="p-4 align-middle font-mono text-xs">
                      {reception.lotQrCode ?? "—"}
                    </td>
                    <td className="p-4 align-middle">
                      {formatWeight(reception.actualWeightKg)}
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={
                          reception.toleranceExceeded ? "text-destructive" : "text-muted-foreground"
                        }
                      >
                        {formatWeight(reception.discrepancyKg)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      {formatDateTime(reception.receivedAt)}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes A1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Dépôt
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Sévérité
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Déclenchée
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {data.recentAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{alert.depotName ?? "—"}</td>
                    <td className="p-4 align-middle">
                      <StatusBadge value={alert.severity} />
                    </td>
                    <td className="p-4 align-middle">
                      <StatusBadge value={alert.status} />
                    </td>
                    <td className="p-4 align-middle">
                      {formatDateTime(alert.firedAt)}
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
