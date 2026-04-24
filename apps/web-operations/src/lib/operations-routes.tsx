import type { ReactNode } from "react";
import { DataTableCard } from "@/components/data-table-card";
import { InfoListCard } from "@/components/info-list-card";
import { StatusBadge } from "@/components/status-badge";
import {
  getCertificationOverview,
  getCommandCenter,
  getDepotOverview,
  getFulfillmentOverview,
  getLaverieOverview,
  getLotsSummary,
  getRegionsOverview,
  getRulesOverview,
  getSalesOverview,
  getTransformationOverview,
  getTransportOverview,
  getUsersOverview,
  type CertificationOverviewResponse,
  type CommandCenterResponse,
  type DepotOverviewResponse,
  type FulfillmentOverviewResponse,
  type LaverieOverviewResponse,
  type LotsSummaryResponse,
  type RegionsOverviewResponse,
  type RulesOverviewResponse,
  type SalesOverviewResponse,
  type TransformationOverviewResponse,
  type TransportOverviewResponse,
  type UsersOverviewResponse,
} from "@/lib/api";
import {
  formatCurrency,
  formatDateTime,
  formatEnumLabel,
  formatNumber,
  formatPercent,
  formatWeight,
} from "@/lib/format";

interface MetricDescriptor {
  label: string;
  value: string;
  helper?: string;
}

export interface OperationsPageConfig<T> {
  title: string;
  description: string;
  emptyMessage: string;
  loader: () => Promise<T | null>;
  requiredPermissions?: string[];
  getMetrics?: (data: T) => MetricDescriptor[];
  renderSections: (data: T) => ReactNode;
}

type AnyOperationsPageConfig = OperationsPageConfig<any>;

export type OperationsRouteKey =
  | "dashboard"
  | "fulfillment"
  | "depot"
  | "laverie"
  | "transformation"
  | "sales"
  | "transport"
  | "certification"
  | "regions"
  | "analytics"
  | "users"
  | "settings";

type AnalyticsData = {
  lots: LotsSummaryResponse | null;
  transport: TransportOverviewResponse | null;
  sales: SalesOverviewResponse | null;
  certification: CertificationOverviewResponse | null;
  users: UsersOverviewResponse | null;
};

function settledValue<T>(result: PromiseSettledResult<T | null>) {
  if (result.status !== "fulfilled") {
    return null;
  }

  return result.value;
}

function hasSomeData(values: unknown[]) {
  return values.some((value) => value !== null);
}

function countValue(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : String(value);
}

async function loadAnalyticsData(): Promise<AnalyticsData | null> {
  const results = await Promise.allSettled([
    getLotsSummary(),
    getTransportOverview(),
    getSalesOverview(),
    getCertificationOverview(),
    getUsersOverview(),
  ]);

  const data: AnalyticsData = {
    lots: settledValue(results[0]),
    transport: settledValue(results[1]),
    sales: settledValue(results[2]),
    certification: settledValue(results[3]),
    users: settledValue(results[4]),
  };

  return hasSomeData(Object.values(data)) ? data : null;
}

const dashboardRoute: OperationsPageConfig<CommandCenterResponse> = {
  title: "Command Center",
  description: "Vue centrale NFN des flux, alertes, nœuds terrain et handoffs critiques.",
  emptyMessage:
    "Le command center n'a recu aucune donnee exploitable depuis l'API.",
  requiredPermissions: ["dashboard.view"],
  loader: getCommandCenter,
  getMetrics: (data) => [
    {
      label: "Collecte annoncée",
      value: countValue(data.summary.announcedPreLots),
      helper: `${formatWeight(data.summary.announcedWeightKg)} prévus`,
    },
    {
      label: "En transit",
      value: countValue(data.summary.inTransitLots),
      helper: `${formatWeight(data.summary.inTransitWeightKg)} suivis`,
    },
    {
      label: "Dépôt D1",
      value: countValue(data.summary.depotLots),
      helper: `${formatWeight(data.summary.depotWeightKg)} stockés`,
    },
    {
      label: "Laverie active",
      value: countValue(data.summary.activeWashRuns),
      helper: `${formatWeight(data.summary.washingWeightKg)} en traitement`,
    },
    {
      label: "Transformation",
      value: countValue(data.summary.activeProductionRuns),
      helper: `${formatWeight(data.summary.productionWeightKg)} engagés`,
    },
    {
      label: "Contrôle ouvert",
      value: countValue(data.summary.openAlerts),
      helper: `${data.summary.pendingCertifications} certifications à émettre`,
    },
  ],
  renderSections: (data) => (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <DataTableCard
          title="Monitor de flux"
          description="Lecture instantanée des volumes et étapes actives de la filière."
          rows={data.flow}
          getRowKey={(row) => row.stage}
          emptyMessage="Aucun flux n'a été calculé."
          columns={[
            {
              header: "Étape",
              render: (row) => row.label,
            },
            {
              header: "Volume",
              render: (row) => row.count,
            },
            {
              header: "Charge",
              render: (row) =>
                row.stage === "sales"
                  ? formatCurrency(row.weightKg, "DZD")
                  : formatWeight(row.weightKg),
            },
            {
              header: "Signal",
              render: (row) =>
                row.count > 0 ? (
                  <StatusBadge value={row.stage === "sales" ? "active" : "in_progress"} />
                ) : (
                  "—"
                ),
            },
          ]}
        />

        <InfoListCard
          title="Synthèse terrain"
          description="Indicateurs prioritaires pour le pilotage central."
          items={[
            {
              label: "Transport sous SLA",
              value: data.transportWatch.length,
              helper: "Jobs actifs ou en attente",
            },
            {
              label: "Nœuds géographiques",
              value: data.terrainNodes.length,
              helper: "Sources et installations visibles",
            },
            {
              label: "Commandes ouvertes",
              value: data.summary.openOrders,
            },
            {
              label: "Alertes critiques",
              value: data.alerts.filter((alert) => alert.severity === "critical").length,
              tone: data.alerts.some((alert) => alert.severity === "critical")
                ? "destructive"
                : "default",
            },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <DataTableCard
          title="Alertes transverses"
          description="A1, sécurité, certification: tout ce qui demande une décision immédiate."
          rows={data.alerts}
          getRowKey={(alert) => `${alert.type}-${alert.id}`}
          emptyMessage="Aucune alerte opérationnelle active."
          columns={[
            {
              header: "Type",
              render: (alert) => formatEnumLabel(alert.type),
            },
            {
              header: "Cible",
              render: (alert) => alert.title,
            },
            {
              header: "Sévérité",
              render: (alert) => <StatusBadge value={alert.severity} />,
            },
            {
              header: "Statut",
              render: (alert) => <StatusBadge value={alert.status} />,
            },
            {
              header: "Survenu le",
              render: (alert) => formatDateTime(alert.occurredAt),
            },
          ]}
        />

        <DataTableCard
          title="Transport watch"
          description="Jobs qui structurent le reste du flux."
          rows={data.transportWatch}
          getRowKey={(job) => job.id}
          emptyMessage="Aucun job à surveiller."
          columns={[
            {
              header: "Lane",
              render: (job) => formatEnumLabel(job.lane),
            },
            {
              header: "Statut",
              render: (job) => <StatusBadge value={job.status} />,
            },
            {
              header: "Lots",
              render: (job) => job.lotCount,
            },
            {
              header: "Transporteur",
              render: (job) => job.transporterName ?? "Non affecté",
            },
            {
              header: "SLA",
              render: (job) => formatDateTime(job.slaDeadline),
            },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <DataTableCard
          title="Timeline NFN"
          description="Derniers événements enregistrés dans la colonne vertébrale append-only."
          rows={data.recentEvents}
          getRowKey={(event) => event.id}
          emptyMessage="Aucun événement récent n'a été retourné."
          columns={[
            {
              header: "Événement",
              render: (event) => formatEnumLabel(event.eventType),
            },
            {
              header: "Agrégat",
              render: (event) => formatEnumLabel(event.aggregateType),
            },
            {
              header: "Acteur",
              render: (event) =>
                event.actorName ?? formatEnumLabel(event.actorType),
            },
            {
              header: "Horodatage",
              render: (event) => formatDateTime(event.occurredAt),
            },
          ]}
        />

        <DataTableCard
          title="Maillage terrain"
          description="Sources et installations géolocalisées visibles par le centre."
          rows={data.terrainNodes}
          getRowKey={(node) => `${node.nodeType}-${node.id}`}
          emptyMessage="Aucun nœud géographique disponible."
          columns={[
            {
              header: "Nœud",
              render: (node) => node.label,
            },
            {
              header: "Type",
              render: (node) => formatEnumLabel(node.nodeType),
            },
            {
              header: "Région",
              render: (node) => node.regionName ?? "—",
            },
            {
              header: "Coordonnées",
              render: (node) =>
                node.latitude && node.longitude
                  ? `${node.latitude}, ${node.longitude}`
                  : "—",
              cellClassName: "font-mono text-xs",
            },
          ]}
        />
      </div>
    </>
  ),
};

const fulfillmentRoute: OperationsPageConfig<FulfillmentOverviewResponse> = {
  title: "Fulfillment",
  description: "Queues d'exécution NFN de la promesse terrain jusqu'à la préparation de vente.",
  emptyMessage: "La vue fulfillment n'a reçu aucune donnée exploitable.",
  requiredPermissions: ["fulfillment.view"],
  loader: getFulfillmentOverview,
  getMetrics: (data) => [
    { label: "Collecte", value: countValue(data.summary.collectionQueue) },
    { label: "Transport", value: countValue(data.summary.transportQueue) },
    { label: "Dépôt", value: countValue(data.summary.depotQueue) },
    { label: "Laverie", value: countValue(data.summary.washingQueue) },
    { label: "Qualification", value: countValue(data.summary.qualificationQueue) },
    { label: "Production", value: countValue(data.summary.productionQueue) },
  ],
  renderSections: (data) => (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard
          title="File de collecte"
          rows={data.collectionQueue}
          getRowKey={(item) => item.id}
          emptyMessage="Aucune pré-lot en attente."
          columns={[
            { header: "Source", render: (item) => item.sourceName ?? "—" },
            {
              header: "Type",
              render: (item) => formatEnumLabel(item.sourceType),
            },
            {
              header: "Statut",
              render: (item) => <StatusBadge value={item.status} />,
            },
            {
              header: "Poids estimé",
              render: (item) => formatWeight(item.estimatedWeightKg),
            },
            {
              header: "Collecteur",
              render: (item) => item.assignedCollectorName ?? "—",
            },
          ]}
        />

        <DataTableCard
          title="File transport"
          rows={data.transportQueue}
          getRowKey={(item) => item.id}
          emptyMessage="Aucun job transport actif."
          columns={[
            { header: "Lane", render: (item) => formatEnumLabel(item.lane) },
            {
              header: "Statut",
              render: (item) => <StatusBadge value={item.status} />,
            },
            { header: "Lots", render: (item) => item.lotCount },
            {
              header: "Transporteur",
              render: (item) => item.transporterName ?? "—",
            },
            {
              header: "SLA",
              render: (item) => formatDateTime(item.slaDeadline),
            },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard
          title="Queue dépôt D1"
          rows={data.depotQueue}
          getRowKey={(item) => item.id}
          emptyMessage="Aucun lot en attente au dépôt."
          columns={[
            {
              header: "Lot",
              render: (item) => item.qrCode,
              cellClassName: "font-mono text-xs",
            },
            {
              header: "Statut",
              render: (item) => <StatusBadge value={item.status} />,
            },
            {
              header: "Urgence",
              render: (item) => <StatusBadge value={item.urgency} />,
            },
            {
              header: "Dépôt / zone",
              render: (item) => `${item.depotName ?? "—"} / ${item.zoneCode ?? "—"}`,
            },
            {
              header: "Poids",
              render: (item) => formatWeight(item.weightKg),
            },
          ]}
        />

        <DataTableCard
          title="Queue laverie D2"
          rows={data.washingQueue}
          getRowKey={(item) => item.id}
          emptyMessage="Aucun run de lavage actif."
          columns={[
            { header: "Lot", render: (item) => item.lotQrCode ?? "—" },
            { header: "Laverie", render: (item) => item.laverieName ?? "—" },
            {
              header: "Poids entrant",
              render: (item) => formatWeight(item.dirtyWeightKg),
            },
            {
              header: "Poids sortant",
              render: (item) =>
                item.cleanWeightKg ? formatWeight(item.cleanWeightKg) : "—",
            },
            {
              header: "Démarré",
              render: (item) => formatDateTime(item.startedAt),
            },
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard
          title="Queue qualification"
          rows={data.qualificationQueue}
          getRowKey={(item) => item.id}
          emptyMessage="Aucune qualification récente."
          columns={[
            { header: "Lot", render: (item) => item.lotQrCode ?? "—" },
            { header: "Grade", render: (item) => item.grade },
            {
              header: "Sécurité",
              render: (item) => <StatusBadge value={item.safetyStatus} />,
            },
            {
              header: "Analyste",
              render: (item) => item.analystName ?? "—",
            },
            {
              header: "Effectué le",
              render: (item) => formatDateTime(item.performedAt),
            },
          ]}
        />

        <DataTableCard
          title="Queue transformation & ventes"
          rows={[...data.productionQueue, ...data.salesQueue]}
          getRowKey={(item) => item.id}
          emptyMessage="Aucune charge aval en cours."
          columns={[
            {
              header: "Référence",
              render: (item) =>
                "buyerCompanyName" in item
                  ? item.buyerCompanyName ?? item.id
                  : item.productName,
            },
            {
              header: "Canal / piste",
              render: (item) =>
                "buyerCompanyName" in item
                  ? formatEnumLabel(item.channel)
                  : formatEnumLabel(item.track),
            },
            {
              header: "Statut",
              render: (item) => <StatusBadge value={item.status} />,
            },
            {
              header: "Charge",
              render: (item) =>
                "buyerCompanyName" in item
                  ? formatCurrency(item.total, item.currency)
                  : formatWeight(item.inputWeightKg),
            },
            {
              header: "Date",
              render: (item) =>
                formatDateTime(
                  "buyerCompanyName" in item ? item.createdAt : item.startedAt,
                ),
            },
          ]}
        />
      </div>
    </>
  ),
};

const depotRoute: OperationsPageConfig<DepotOverviewResponse> = {
  title: "Depot",
  description: "Reception, stockage, pre-tri et alertes logistiques.",
  emptyMessage: "Le module depot n'a recu aucune donnee backend.",
  requiredPermissions: ["depot.view"],
  loader: getDepotOverview,
  getMetrics: (data) => [
    {
      label: "Depots",
      value: countValue(data.summary.totalDepots),
    },
    {
      label: "Depots actifs",
      value: countValue(data.summary.activeDepots),
    },
    {
      label: "Capacite",
      value: formatWeight(data.summary.totalCapacityKg),
    },
    {
      label: "Stock courant",
      value: formatWeight(data.summary.currentWeightKg),
      helper: formatPercent(data.summary.occupancyRate),
    },
    {
      label: "Alertes ouvertes",
      value: countValue(data.summary.openAlerts),
    },
  ],
  renderSections: (data) => (
    <>
      <DataTableCard
        title="Depots"
        description="Capacite, occupation et responsables par site."
        rows={data.depots}
        getRowKey={(depot) => depot.id}
        emptyMessage="Aucun depot n'a ete retourne."
        columns={[
          { header: "Nom", render: (depot) => depot.name },
          { header: "Region", render: (depot) => depot.regionName ?? "—" },
          {
            header: "Responsable",
            render: (depot) => depot.managerName ?? "—",
          },
          {
            header: "Stock",
            render: (depot) =>
              `${formatWeight(depot.currentWeightKg)} / ${formatWeight(depot.capacityKg)}`,
          },
          {
            header: "Occupation",
            render: (depot) => formatPercent(depot.occupancyRate),
          },
          {
            header: "Etat",
            render: (depot) => (
              <StatusBadge value={depot.active ? "active" : "suspended"} />
            ),
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard
          title="Receptions recentes"
          rows={data.recentReceptions}
          getRowKey={(reception) => reception.id}
          emptyMessage="Aucune reception recente n'a ete retournee."
          columns={[
            {
              header: "Depot",
              render: (reception) => reception.depotName ?? "—",
            },
            {
              header: "Lot",
              render: (reception) => reception.lotQrCode ?? "—",
              cellClassName: "font-mono text-xs",
            },
            {
              header: "Poids",
              render: (reception) => formatWeight(reception.actualWeightKg),
            },
            {
              header: "Ecart",
              render: (reception) => formatWeight(reception.discrepancyKg),
            },
            {
              header: "Recu le",
              render: (reception) => formatDateTime(reception.receivedAt),
            },
          ]}
        />

        <DataTableCard
          title="Alertes A1"
          rows={data.recentAlerts}
          getRowKey={(alert) => alert.id}
          emptyMessage="Aucune alerte recente n'a ete retournee."
          columns={[
            { header: "Depot", render: (alert) => alert.depotName ?? "—" },
            {
              header: "Severite",
              render: (alert) => <StatusBadge value={alert.severity} />,
            },
            {
              header: "Statut",
              render: (alert) => <StatusBadge value={alert.status} />,
            },
            {
              header: "Declenchee",
              render: (alert) => formatDateTime(alert.firedAt),
            },
          ]}
        />
      </div>
    </>
  ),
};

const laverieRoute: OperationsPageConfig<LaverieOverviewResponse> = {
  title: "Laverie",
  description: "Installations, cycles actifs et qualifications recentes.",
  emptyMessage: "Le module laverie n'a recu aucune donnee backend.",
  requiredPermissions: ["laverie.view"],
  loader: getLaverieOverview,
  getMetrics: (data) => [
    { label: "Laveries", value: countValue(data.summary.totalLaveries) },
    {
      label: "Laveries actives",
      value: countValue(data.summary.activeLaveries),
    },
    { label: "Cycles actifs", value: countValue(data.summary.activeRuns) },
    { label: "Cycles totaux", value: countValue(data.summary.totalWashRuns) },
    { label: "Lots qualifies", value: countValue(data.summary.gradedLots) },
  ],
  renderSections: (data) => (
    <>
      <DataTableCard
        title="Installations"
        description="Capacites et responsables par laverie."
        rows={data.laveries}
        getRowKey={(laverie) => laverie.id}
        emptyMessage="Aucune laverie n'a ete retournee."
        columns={[
          { header: "Nom", render: (laverie) => laverie.name },
          { header: "Adresse", render: (laverie) => laverie.address },
          {
            header: "Capacite / jour",
            render: (laverie) => formatWeight(laverie.dailyCapacityKg),
          },
          {
            header: "Responsable",
            render: (laverie) => laverie.managerName ?? "—",
          },
          {
            header: "Etat",
            render: (laverie) => (
              <StatusBadge value={laverie.active ? "active" : "suspended"} />
            ),
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DataTableCard
          title="Cycles actifs"
          rows={data.activeRuns}
          getRowKey={(run) => run.id}
          emptyMessage="Aucun cycle actif n'a ete retourne."
          columns={[
            { header: "Laverie", render: (run) => run.laverieName ?? "—" },
            {
              header: "Poids entrant",
              render: (run) => formatWeight(run.dirtyWeightKg),
            },
            {
              header: "Eau",
              render: (run) =>
                run.waterLiters ? `${formatNumber(run.waterLiters)} L` : "—",
            },
            {
              header: "Temperature",
              render: (run) => (run.waterTempC ? `${run.waterTempC}°C` : "—"),
            },
            {
              header: "Demarre",
              render: (run) => formatDateTime(run.startedAt),
            },
          ]}
        />

        <DataTableCard
          title="Qualifications recentes"
          rows={data.recentQualifications}
          getRowKey={(qualification) => qualification.id}
          emptyMessage="Aucune qualification recente n'a ete retournee."
          columns={[
            {
              header: "Grade",
              render: (qualification) => qualification.grade,
            },
            {
              header: "Securite",
              render: (qualification) => (
                <StatusBadge value={qualification.safetyStatus} />
              ),
            },
            {
              header: "Longueur fibre",
              render: (qualification) =>
                qualification.fiberLengthMm
                  ? `${formatNumber(qualification.fiberLengthMm)} mm`
                  : "—",
            },
            {
              header: "Diametre",
              render: (qualification) =>
                qualification.fiberDiameterMicron
                  ? `${formatNumber(qualification.fiberDiameterMicron)} um`
                  : "—",
            },
            {
              header: "Controle le",
              render: (qualification) =>
                formatDateTime(qualification.performedAt),
            },
          ]}
        />
      </div>
    </>
  ),
};

const transformationRoute: OperationsPageConfig<TransformationOverviewResponse> =
  {
    title: "Transformation",
    description: "Pilotage des transformateurs, runs de production et sorties.",
    emptyMessage: "Le module transformation n'a recu aucune donnee backend.",
    requiredPermissions: ["transformation.view"],
    loader: getTransformationOverview,
    getMetrics: (data) => [
      {
        label: "Transformateurs",
        value: countValue(data.summary.totalTransformers),
      },
      {
        label: "Sites actifs",
        value: countValue(data.summary.activeTransformers),
      },
      { label: "Runs actifs", value: countValue(data.summary.activeRuns) },
      { label: "Runs totaux", value: countValue(data.summary.totalRuns) },
      {
        label: "Produits recents",
        value: countValue(data.summary.recentProducts),
      },
    ],
    renderSections: (data) => (
      <>
        <DataTableCard
          title="Transformateurs"
          description="Capacite et responsable par site de production."
          rows={data.transformers}
          getRowKey={(transformer) => transformer.id}
          emptyMessage="Aucun transformateur n'a ete retourne."
          columns={[
            { header: "Nom", render: (transformer) => transformer.name },
            {
              header: "Piste",
              render: (transformer) => formatEnumLabel(transformer.track),
            },
            {
              header: "Capacite / jour",
              render: (transformer) =>
                formatWeight(transformer.dailyCapacityKg),
            },
            {
              header: "Responsable",
              render: (transformer) => transformer.managerName ?? "—",
            },
            {
              header: "Etat",
              render: (transformer) => (
                <StatusBadge
                  value={transformer.active ? "active" : "suspended"}
                />
              ),
            },
          ]}
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <DataTableCard
            title="Runs actifs"
            rows={data.activeRuns}
            getRowKey={(run) => run.id}
            emptyMessage="Aucun run actif n'a ete retourne."
            columns={[
              {
                header: "Site",
                render: (run) => run.transformerName ?? "—",
              },
              {
                header: "Entree",
                render: (run) => formatWeight(run.inputWeightKg),
              },
              {
                header: "Sortie",
                render: (run) =>
                  run.outputWeightKg ? formatWeight(run.outputWeightKg) : "—",
              },
              {
                header: "Operateur",
                render: (run) => run.operatorName ?? "—",
              },
              {
                header: "Demarre",
                render: (run) => formatDateTime(run.startedAt),
              },
            ]}
          />

          <DataTableCard
            title="Produits recents"
            rows={data.recentProducts}
            getRowKey={(product) => product.id}
            emptyMessage="Aucun produit recent n'a ete retourne."
            columns={[
              {
                header: "Code",
                render: (product) => product.productCode,
                cellClassName: "font-mono text-xs",
              },
              {
                header: "Piste",
                render: (product) => formatEnumLabel(product.track),
              },
              {
                header: "Type",
                render: (product) => product.productTypeCode,
              },
              {
                header: "Poids",
                render: (product) => formatWeight(product.weightKg),
              },
              {
                header: "Statut",
                render: (product) => <StatusBadge value={product.status} />,
              },
            ]}
          />
        </div>
      </>
    ),
  };

const salesRoute: OperationsPageConfig<SalesOverviewResponse> = {
  title: "Ventes",
  description: "Commandes, canaux de vente et suivi de paiement.",
  emptyMessage: "Le module ventes n'a recu aucune donnee backend.",
  requiredPermissions: ["sales.view"],
  loader: getSalesOverview,
  getMetrics: (data) => [
    { label: "Total commandes", value: countValue(data.summary.totalOrders) },
    { label: "Ouvertes", value: countValue(data.summary.openOrders) },
    { label: "Expediees", value: countValue(data.summary.shippedOrders) },
    { label: "Livrees", value: countValue(data.summary.deliveredOrders) },
    { label: "Retours", value: countValue(data.summary.returnedOrders) },
  ],
  renderSections: (data) => (
    <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
      <DataTableCard
        title="Commandes recentes"
        description="Derniers mouvements du carnet de commandes."
        rows={data.orders}
        getRowKey={(order) => order.id}
        emptyMessage="Aucune commande recente n'a ete retournee."
        columns={[
          {
            header: "Acheteur",
            render: (order) => order.buyerCompanyName ?? "—",
          },
          {
            header: "Canal",
            render: (order) => formatEnumLabel(order.channel),
          },
          {
            header: "Statut",
            render: (order) => <StatusBadge value={order.status} />,
          },
          {
            header: "Paiement",
            render: (order) => <StatusBadge value={order.paymentStatus} />,
          },
          {
            header: "Montant",
            render: (order) => formatCurrency(order.total, order.currency),
          },
          {
            header: "Creee le",
            render: (order) => formatDateTime(order.createdAt),
          },
        ]}
      />

      <InfoListCard
        title="Breakdown statuts"
        description="Repartition des commandes par etat."
        items={data.summary.statusBreakdown.map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown ventes n'a ete retourne."
      />
    </div>
  ),
};

const transportRoute: OperationsPageConfig<TransportOverviewResponse> = {
  title: "Transport",
  description: "Affectation, suivi et execution des jobs de transport.",
  emptyMessage: "Le module transport n'a recu aucune donnee backend.",
  requiredPermissions: ["transport.view"],
  loader: getTransportOverview,
  getMetrics: (data) => [
    { label: "Jobs totaux", value: countValue(data.summary.totalJobs) },
    { label: "En attente", value: countValue(data.summary.pendingJobs) },
    { label: "En cours", value: countValue(data.summary.activeJobs) },
    { label: "Livres", value: countValue(data.summary.deliveredJobs) },
    { label: "Urgents", value: countValue(data.summary.urgentJobs) },
  ],
  renderSections: (data) => (
    <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
      <DataTableCard
        title="Jobs recents"
        description="Dernieres affectations et avancee des missions."
        rows={data.jobs}
        getRowKey={(job) => job.id}
        emptyMessage="Aucun job recent n'a ete retourne."
        columns={[
          {
            header: "Transporteur",
            render: (job) => job.transporterName ?? "Non affecte",
          },
          { header: "Lane", render: (job) => formatEnumLabel(job.lane) },
          {
            header: "Origine",
            render: (job) => formatEnumLabel(job.originType),
          },
          {
            header: "Destination",
            render: (job) => formatEnumLabel(job.destinationType),
          },
          { header: "Lots", render: (job) => job.lotCount },
          {
            header: "Statut",
            render: (job) => <StatusBadge value={job.status} />,
          },
          {
            header: "SLA",
            render: (job) => formatDateTime(job.slaDeadline),
          },
        ]}
      />

      <InfoListCard
        title="Breakdown transport"
        description="Volumes connus par statut de mission."
        items={data.summary.statusBreakdown.map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown transport n'a ete retourne."
      />
    </div>
  ),
};

const certificationRoute: OperationsPageConfig<CertificationOverviewResponse> =
  {
    title: "Certification",
    description: "Emission, suivi et revocation des sceaux produits.",
    emptyMessage: "Le module certification n'a recu aucune donnee backend.",
    requiredPermissions: ["certification.view"],
    loader: getCertificationOverview,
    getMetrics: (data) => [
      {
        label: "Total dossiers",
        value: countValue(data.summary.totalCertifications),
      },
      { label: "En attente", value: countValue(data.summary.pending) },
      { label: "Emis", value: countValue(data.summary.issued) },
      { label: "Revoques", value: countValue(data.summary.revoked) },
    ],
    renderSections: (data) => (
      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <DataTableCard
          title="Certifications recentes"
          description="Derniers etats de certification produits."
          rows={data.certifications}
          getRowKey={(item) => item.id}
          emptyMessage="Aucune certification recente n'a ete retournee."
          columns={[
            {
              header: "Produit",
              render: (item) => item.productCode,
              cellClassName: "font-mono text-xs",
            },
            {
              header: "Statut",
              render: (item) => <StatusBadge value={item.status} />,
            },
            {
              header: "Emis par",
              render: (item) => item.issuedByName ?? "—",
            },
            {
              header: "Emis le",
              render: (item) => formatDateTime(item.issuedAt),
            },
            {
              header: "Cree le",
              render: (item) => formatDateTime(item.createdAt),
            },
          ]}
        />

        <InfoListCard
          title="Breakdown certification"
          description="Repartition des dossiers par statut."
          items={data.summary.statusBreakdown.map((row) => ({
            label: formatEnumLabel(row.status),
            value: row.count,
          }))}
          emptyMessage="Aucun breakdown certification n'a ete retourne."
        />
      </div>
    ),
  };

const regionsRoute: OperationsPageConfig<RegionsOverviewResponse> = {
  title: "Regions",
  description: "Carte des regions, codes et typologies administratives.",
  emptyMessage: "Le module regions n'a recu aucune donnee backend.",
  requiredPermissions: ["regions.view"],
  loader: getRegionsOverview,
  getMetrics: (data) => [
    { label: "Regions", value: countValue(data.summary.totalRegions) },
    { label: "Types distincts", value: countValue(data.summary.typeBreakdown.length) },
  ],
  renderSections: (data) => (
    <div className="grid gap-4 xl:grid-cols-[1.9fr_1fr]">
      <DataTableCard
        title="Regions"
        description="Codes, rattachements et coordonnees connues."
        rows={data.regions}
        getRowKey={(region) => region.id}
        emptyMessage="Aucune region n'a ete retournee."
        columns={[
          { header: "Nom", render: (region) => region.name },
          { header: "Code", render: (region) => region.code },
          { header: "Type", render: (region) => formatEnumLabel(region.type) },
          { header: "Parent", render: (region) => region.parentId ?? "—" },
          {
            header: "Coordonnees",
            render: (region) =>
              region.latitude && region.longitude
                ? `${region.latitude}, ${region.longitude}`
                : "—",
          },
          {
            header: "Creee le",
            render: (region) => formatDateTime(region.createdAt),
          },
        ]}
      />

      <InfoListCard
        title="Breakdown types"
        description="Repartition de la structure geographique."
        items={data.summary.typeBreakdown.map((row) => ({
          label: formatEnumLabel(row.type),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown regions n'a ete retourne."
      />
    </div>
  ),
};

const analyticsRoute: OperationsPageConfig<AnalyticsData> = {
  title: "Statistiques",
  description: "Breakdowns transverses pour lots, transport, ventes et utilisateurs.",
  emptyMessage: "Le module statistiques n'a recu aucune donnee exploitable.",
  requiredPermissions: ["analytics.view"],
  loader: loadAnalyticsData,
  getMetrics: (data) => [
    {
      label: "Lots",
      value: countValue(data.lots?.summary.totalLots),
    },
    {
      label: "Jobs transport",
      value: countValue(data.transport?.summary.totalJobs),
    },
    {
      label: "Commandes",
      value: countValue(data.sales?.summary.totalOrders),
    },
    {
      label: "Certifications",
      value: countValue(data.certification?.summary.totalCertifications),
    },
    {
      label: "Utilisateurs",
      value: countValue(data.users?.summary.totalUsers),
    },
  ],
  renderSections: (data) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <InfoListCard
        title="Statuts lots"
        items={(data.lots?.summary.statusBreakdown ?? []).map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown lots n'a ete retourne."
      />

      <InfoListCard
        title="Statuts transport"
        items={(data.transport?.summary.statusBreakdown ?? []).map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown transport n'a ete retourne."
      />

      <InfoListCard
        title="Statuts ventes"
        items={(data.sales?.summary.statusBreakdown ?? []).map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown ventes n'a ete retourne."
      />

      <InfoListCard
        title="Types utilisateurs"
        items={(data.users?.summary.typeBreakdown ?? []).map((row) => ({
          label: formatEnumLabel(row.userType),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown utilisateurs n'a ete retourne."
      />

      <InfoListCard
        title="Statuts utilisateurs"
        items={(data.users?.summary.statusBreakdown ?? []).map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun statut utilisateur n'a ete retourne."
      />

      <InfoListCard
        title="Statuts certification"
        items={(data.certification?.summary.statusBreakdown ?? []).map((row) => ({
          label: formatEnumLabel(row.status),
          value: row.count,
        }))}
        emptyMessage="Aucun breakdown certification n'a ete retourne."
      />
    </div>
  ),
};

const usersRoute: OperationsPageConfig<UsersOverviewResponse> = {
  title: "Utilisateurs",
  description: "Administration des comptes, types d'acteur et activite recente.",
  emptyMessage: "Le module utilisateurs n'a recu aucune donnee backend.",
  requiredPermissions: ["users.view"],
  loader: getUsersOverview,
  getMetrics: (data) => [
    { label: "Total", value: countValue(data.summary.totalUsers) },
    { label: "Actifs", value: countValue(data.summary.activeUsers) },
    { label: "Suspendus", value: countValue(data.summary.suspendedUsers) },
    { label: "Supprimes", value: countValue(data.summary.deletedUsers) },
  ],
  renderSections: (data) => (
    <>
      <DataTableCard
        title="Utilisateurs recents"
        description="Parc d'utilisateurs et derniere connexion connue."
        rows={data.users}
        getRowKey={(user) => user.id}
        emptyMessage="Aucun utilisateur n'a ete retourne."
        columns={[
          { header: "Nom", render: (user) => user.fullName },
          { header: "Email", render: (user) => user.email },
          { header: "Type", render: (user) => formatEnumLabel(user.userType) },
          { header: "Region", render: (user) => user.regionName ?? "—" },
          {
            header: "Statut",
            render: (user) => <StatusBadge value={user.status} />,
          },
          {
            header: "Derniere connexion",
            render: (user) => formatDateTime(user.lastLoginAt),
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <InfoListCard
          title="Repartition par type"
          items={data.summary.typeBreakdown.map((row) => ({
            label: formatEnumLabel(row.userType),
            value: row.count,
          }))}
          emptyMessage="Aucune repartition par type n'a ete retournee."
        />

        <InfoListCard
          title="Repartition par statut"
          items={data.summary.statusBreakdown.map((row) => ({
            label: formatEnumLabel(row.status),
            value: row.count,
          }))}
          emptyMessage="Aucune repartition par statut n'a ete retournee."
        />
      </div>
    </>
  ),
};

const settingsRoute: OperationsPageConfig<RulesOverviewResponse> = {
  title: "Parametres",
  description: "Regles metier, versions et fenetres d'effet configurees.",
  emptyMessage: "Le module parametres n'a recu aucune donnee backend.",
  requiredPermissions: ["rules.view"],
  loader: getRulesOverview,
  getMetrics: (data) => [
    { label: "Regles total", value: countValue(data.summary.totalRules) },
    { label: "Regles actives", value: countValue(data.summary.activeRules) },
  ],
  renderSections: (data) => (
    <DataTableCard
      title="Regles configurees"
      description="Dernieres versions connues du moteur de regles."
      rows={data.rules}
      getRowKey={(rule) => rule.id}
      emptyMessage="Aucune regle n'a ete retournee."
      columns={[
        {
          header: "Cle",
          render: (rule) => rule.ruleKey,
          cellClassName: "font-mono text-xs",
        },
        {
          header: "Description",
          render: (rule) => rule.description ?? "—",
        },
        {
          header: "Version",
          render: (rule) => rule.version ?? "—",
        },
        {
          header: "Debut",
          render: (rule) => formatDateTime(rule.effectiveFrom),
        },
        {
          header: "Fin",
          render: (rule) => formatDateTime(rule.effectiveTo),
        },
        {
          header: "Cree par",
          render: (rule) => rule.createdByName ?? "—",
        },
      ]}
    />
  ),
};

const operationsRoutes: Record<OperationsRouteKey, AnyOperationsPageConfig> = {
  dashboard: dashboardRoute,
  fulfillment: fulfillmentRoute,
  depot: depotRoute,
  laverie: laverieRoute,
  transformation: transformationRoute,
  sales: salesRoute,
  transport: transportRoute,
  certification: certificationRoute,
  regions: regionsRoute,
  analytics: analyticsRoute,
  users: usersRoute,
  settings: settingsRoute,
};

export function getOperationsRoute(routeKey: OperationsRouteKey) {
  return operationsRoutes[routeKey];
}
