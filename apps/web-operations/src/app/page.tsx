import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ba33/ui-web";
import {
  getCertificationOverview,
  getDepotOverview,
  getLaverieOverview,
  getLotsSummary,
  getRecentEvents,
  getSalesOverview,
  getTransformationOverview,
  getTransportOverview,
} from "@/lib/api";
import {
  formatDateTime,
  formatEnumLabel,
  formatPercent,
  formatWeight,
} from "@/lib/format";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { UnavailableState } from "@/components/unavailable-state";

export default async function DashboardPage() {
  const [
    lots,
    events,
    depot,
    transport,
    laverie,
    transformation,
    sales,
    certification,
  ] = await Promise.all([
    getLotsSummary(),
    getRecentEvents(),
    getDepotOverview(),
    getTransportOverview(),
    getLaverieOverview(),
    getTransformationOverview(),
    getSalesOverview(),
    getCertificationOverview(),
  ]);

  if (
    !lots ||
    !events ||
    !depot ||
    !transport ||
    !laverie ||
    !transformation ||
    !sales ||
    !certification
  ) {
    return (
      <div className="p-8 space-y-8">
        <PageHeader
          title="Tableau de bord"
          description="Vue d’ensemble de la plateforme ba33."
        />
        <UnavailableState message="Le backend n’est pas joignable. Lancez l’API sur le port 3001 pour alimenter ce tableau de bord." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Tableau de bord"
        description="Vue consolidée des flux, stocks, opérations et certification."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Lots totaux"
          value={lots.summary.totalLots.toString()}
          helper={`${lots.summary.urgentLots} urgents`}
        />
        <MetricCard
          label="Stock dépôt"
          value={formatWeight(depot.summary.currentWeightKg)}
          helper={`${formatPercent(depot.summary.occupancyRate)} d’occupation`}
        />
        <MetricCard
          label="Transport actif"
          value={transport.summary.activeJobs.toString()}
          helper={`${transport.summary.pendingJobs} en attente`}
        />
        <MetricCard
          label="Lavage actif"
          value={laverie.summary.activeRuns.toString()}
          helper={`${laverie.summary.totalWashRuns} cycles enregistrés`}
        />
        <MetricCard
          label="Transformation"
          value={transformation.summary.activeRuns.toString()}
          helper={`${transformation.summary.recentProducts} produits récents`}
        />
        <MetricCard
          label="Commandes ouvertes"
          value={sales.summary.openOrders.toString()}
          helper={`${certification.summary.pending} certifications en attente`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Derniers événements observés dans la chaîne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Événement
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Agrégat
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Acteur
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Horodatage
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-medium">
                      {formatEnumLabel(event.eventType)}
                      </td>
                      <td className="p-4 align-middle">
                        {formatEnumLabel(event.aggregateType)}
                      </td>
                      <td className="p-4 align-middle">
                        {event.actorName ?? formatEnumLabel(event.actorType)}
                      </td>
                      <td className="p-4 align-middle">
                        {formatDateTime(event.occurredAt)}
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
            <CardTitle>Alertes et file d’attente</CardTitle>
            <CardDescription>
              Points chauds à surveiller immédiatement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted-foreground">Alertes dépôt ouvertes</div>
              <div className="mt-1 font-mono text-2xl font-semibold">
                {depot.summary.openAlerts}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted-foreground">Lots en transit</div>
              <div className="mt-1 font-mono text-2xl font-semibold">
                {lots.summary.inTransitLots}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted-foreground">Commandes ouvertes</div>
              <div className="mt-1 font-mono text-2xl font-semibold">
                {sales.summary.openOrders}
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted-foreground">Certifications en attente</div>
              <div className="mt-1 font-mono text-2xl font-semibold">
                {certification.summary.pending}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lots récents</CardTitle>
            <CardDescription>
              Dernières entrées créées dans la colonne vertébrale de traçabilité.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      QR
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      État
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Poids déclaré
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Créé le
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {lots.recentLots.map((lot) => (
                    <tr
                      key={lot.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-mono text-xs">
                        {lot.qrCode}
                      </td>
                      <td className="p-4 align-middle">
                        {formatEnumLabel(lot.sourceType)}
                      </td>
                      <td className="p-4 align-middle">
                      <StatusBadge value={lot.status} />
                      </td>
                      <td className="p-4 align-middle">
                        {formatWeight(lot.declaredWeightKg)}
                      </td>
                      <td className="p-4 align-middle">
                        {formatDateTime(lot.createdAt)}
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
            <CardTitle>Dernières alertes dépôt</CardTitle>
            <CardDescription>
              Retour rapide sur les déclenchements A1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {depot.recentAlerts.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Aucune alerte récente.
              </div>
            ) : (
              depot.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{alert.depotName ?? "Dépôt"}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(alert.firedAt)}
                      </div>
                    </div>
                    <StatusBadge value={alert.severity} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
