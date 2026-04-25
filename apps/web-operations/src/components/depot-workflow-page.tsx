"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import { DataTableCard } from "@/components/data-table-card";
import { InfoListCard } from "@/components/info-list-card";
import {
  type OperationsMetric,
  OperationsPageShell,
} from "@/components/operations-page-shell";
import { StatusBadge } from "@/components/status-badge";
import { useSession } from "@/components/session-provider";
import {
  ActionFeedback,
  WorkflowField,
  WorkflowSelect,
  WorkflowTextarea,
} from "@/components/workflow-form-controls";
import { CollectionJobsPanel } from "@/components/collection-jobs-panel";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  createDepotDispatch,
  createDepotReception,
  getDepotOverview,
  type DepotOverviewResponse,
} from "@/lib/api";
import {
  formatDateTime,
  formatEnumLabel,
  formatPercent,
  formatWeight,
  toNumber,
} from "@/lib/format";

export function DepotWorkflowPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("depot.view");
  const canReceive = hasPermission("depot.receive");
  const canDispatch = hasPermission("depot.dispatch");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"default" | "destructive" | "success">(
    "default",
  );
  const [submitting, setSubmitting] = useState<"receive" | "dispatch" | null>(null);
  const { data, error, loading, refresh, updatedAt } = useAsyncData<DepotOverviewResponse>(
    () => {
      if (!session || !canViewPage) {
        return Promise.resolve(null);
      }

      return getDepotOverview();
    },
    [session?.user.id, canViewPage],
  );

  const [receiveLotId, setReceiveLotId] = useState("");
  const [receiveDepotId, setReceiveDepotId] = useState("");
  const [receiveZoneId, setReceiveZoneId] = useState("");
  const [receiveWeightKg, setReceiveWeightKg] = useState("");
  const [receiveNotes, setReceiveNotes] = useState("");
  // Stage 3 — Dépositaire / Centre de tri
  const [receiveLotClassification, setReceiveLotClassification] = useState<"class_a"|"class_b"|"">("");
  const [receiveStackTempC, setReceiveStackTempC] = useState("");
  const [receiveHumidityEntry, setReceiveHumidityEntry] = useState("");
  const [receiveVegetalMatter, setReceiveVegetalMatter] = useState("");
  const [receivePlannedExit, setReceivePlannedExit] = useState("");

  const [dispatchLotId, setDispatchLotId] = useState("");
  const [dispatchDepotId, setDispatchDepotId] = useState("");
  const [dispatchLaverieId, setDispatchLaverieId] = useState("");
  const [dispatchWeightKg, setDispatchWeightKg] = useState("");
  // Stage 4 — Sortie dépositaire
  const [dispatchDestinationType, setDispatchDestinationType] = useState<"laverie"|"transformer_direct">("laverie");
  const [dispatchFluxAKg, setDispatchFluxAKg] = useState("");
  const [dispatchFluxBKg, setDispatchFluxBKg] = useState("");
  const [dispatchImpurityRate, setDispatchImpurityRate] = useState("");
  const [dispatchHumidityExit, setDispatchHumidityExit] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    const intakeLot = data.intakeQueue[0];
    const intakeDepot = data.depots[0];
    const intakeZone =
      data.zones.find((zone) => zone.depotId === (receiveDepotId || intakeDepot?.id)) ??
      null;

    setReceiveLotId((value) => value || intakeLot?.id || "");
    setReceiveDepotId((value) => value || intakeDepot?.id || "");
    setReceiveZoneId((value) => value || intakeZone?.id || "");
    setReceiveWeightKg((value) => {
      if (value) {
        return value;
      }

      return intakeLot
        ? String(toNumber(intakeLot.actualWeightKg ?? intakeLot.declaredWeightKg))
        : "";
    });

    const dispatchLot = data.dispatchQueue[0];
    const dispatchDepot =
      data.depots.find((depot) => depot.name === dispatchLot?.depotName) ?? data.depots[0];

    setDispatchLotId((value) => value || dispatchLot?.id || "");
    setDispatchDepotId((value) => value || dispatchDepot?.id || "");
    setDispatchLaverieId((value) => value || data.laveries[0]?.id || "");
    setDispatchWeightKg((value) =>
      value ? value : dispatchLot ? String(toNumber(dispatchLot.weightKg)) : "",
    );
  }, [data, receiveDepotId]);

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Capacité totale",
          value: formatWeight(data.summary.totalCapacityKg),
          helper: `${data.summary.activeDepots}/${data.summary.totalDepots} dépôts actifs`,
        },
        {
          label: "Stock courant",
          value: formatWeight(data.summary.currentWeightKg),
          helper: formatPercent(data.summary.occupancyRate),
        },
        {
          label: "Réceptions E1",
          value: String(data.recentReceptions.length),
          helper: `${data.intakeQueue.length} lots encore en entrée`,
        },
        {
          label: "Alertes A1",
          value: String(data.summary.openAlerts),
          helper: `${data.dispatchQueue.length} lots prêts pour S1`,
        },
      ]
    : undefined;

  async function handleReceive() {
    if (!receiveLotId || !receiveDepotId || !receiveWeightKg) {
      setFeedback("Complète le lot, le dépôt et le poids E1.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("receive");
    setFeedback(null);

    const result = await createDepotReception({
      depotId: receiveDepotId,
      lotId: receiveLotId,
      zoneId: receiveZoneId || undefined,
      actualWeightKg: Number(receiveWeightKg),
      notes: receiveNotes || undefined,
      lotClassification: receiveLotClassification || undefined,
      stackTemperatureC: receiveStackTempC ? Number(receiveStackTempC) : undefined,
      humidityEntryPercent: receiveHumidityEntry ? Number(receiveHumidityEntry) : undefined,
      vegetalMatterPercent: receiveVegetalMatter ? Number(receiveVegetalMatter) : undefined,
      plannedExitDate: receivePlannedExit || undefined,
    });

    if (!result) {
      setFeedback("Impossible d'enregistrer la réception E1.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Réception E1 enregistrée pour le lot ${result.lotId}.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  async function handleDispatch() {
    if (!dispatchLotId || !dispatchDepotId || !dispatchLaverieId) {
      setFeedback("Sélectionne le lot, le dépôt de sortie et la laverie cible.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("dispatch");
    setFeedback(null);

    const result = await createDepotDispatch({
      depotId: dispatchDepotId,
      lotId: dispatchLotId,
      destinationLaverieId: dispatchDestinationType === "laverie" ? dispatchLaverieId : undefined,
      manifestWeightKg: dispatchWeightKg ? Number(dispatchWeightKg) : undefined,
      destinationDirect: dispatchDestinationType || undefined,
      fluxAWeightKg: dispatchFluxAKg ? Number(dispatchFluxAKg) : undefined,
      fluxBWeightKg: dispatchFluxBKg ? Number(dispatchFluxBKg) : undefined,
      impurityRatePercent: dispatchImpurityRate ? Number(dispatchImpurityRate) : undefined,
      humidityExitPercent: dispatchHumidityExit ? Number(dispatchHumidityExit) : undefined,
    });

    if (!result) {
      setFeedback("Impossible de générer l'audit S1 / dispatch laverie.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Sortie S1 enregistrée pour le lot ${result.lotId}.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  const receiveZones =
    data?.zones.filter((zone) => zone.depotId === receiveDepotId) ?? [];

  return (
    <OperationsPageShell
      title="Dépôt D1"
      description="Réception E1, pré-tri sécurisé, affectation zone et préparation S1 vers la laverie."
      requiredPermissions={["depot.view"]}
      loading={loading}
      updatedAt={updatedAt}
      error={canViewPage && !data ? error : null}
      onRefresh={refresh}
      metrics={metrics}
      showContent={Boolean(data)}
    >
      {feedback ? <ActionFeedback message={feedback} tone={feedbackTone} /> : null}

      {data ? (
        <>
          <CollectionJobsPanel />

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Actions dépôt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoListCard
                  title="Capacités opérateur"
                  items={[
                    {
                      label: "Réception E1",
                      value: canReceive ? "Active" : "Lecture seule",
                      tone: canReceive ? "success" : "warning",
                    },
                    {
                      label: "Dispatch S1",
                      value: canDispatch ? "Active" : "Lecture seule",
                      tone: canDispatch ? "success" : "warning",
                    },
                    {
                      label: "Zones disponibles",
                      value: data.zones.length,
                      helper: "Pré-tri et stockage intermédaire",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>E1 Réception & validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Lot entrant">
                  <WorkflowSelect
                    value={receiveLotId}
                    onChange={(event) => {
                      const lotId = event.target.value;
                      setReceiveLotId(lotId);
                      const lot = data.intakeQueue.find((item) => item.id === lotId);
                      setReceiveWeightKg(
                        String(toNumber(lot?.actualWeightKg ?? lot?.declaredWeightKg)),
                      );
                    }}
                    disabled={!canReceive}
                  >
                    <option value="">Sélectionner un lot</option>
                    {data.intakeQueue.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.qrCode} · {formatEnumLabel(lot.status)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Dépôt">
                  <WorkflowSelect
                    value={receiveDepotId}
                    onChange={(event) => {
                      setReceiveDepotId(event.target.value);
                      const firstZone = data.zones.find(
                        (zone) => zone.depotId === event.target.value,
                      );
                      setReceiveZoneId(firstZone?.id ?? "");
                    }}
                    disabled={!canReceive}
                  >
                    <option value="">Sélectionner un dépôt</option>
                    {data.depots.map((depot) => (
                      <option key={depot.id} value={depot.id}>
                        {depot.name}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Zone de placement">
                  <WorkflowSelect
                    value={receiveZoneId}
                    onChange={(event) => setReceiveZoneId(event.target.value)}
                    disabled={!canReceive}
                  >
                    <option value="">Sans zone</option>
                    {receiveZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.code} · {formatEnumLabel(zone.purpose)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Poids réel (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={receiveWeightKg}
                    onChange={(event) => setReceiveWeightKg(event.target.value)}
                    disabled={!canReceive}
                  />
                </WorkflowField>
                <WorkflowField label="Notes opérateur">
                  <WorkflowTextarea
                    value={receiveNotes}
                    onChange={(event) => setReceiveNotes(event.target.value)}
                    disabled={!canReceive}
                    placeholder="Anomalie, humidité, état du lot..."
                  />
                </WorkflowField>

                {/* Stage 3 — Dépositaire / Centre de tri */}
                <WorkflowField label="Classification tri">
                  <WorkflowSelect
                    value={receiveLotClassification}
                    onChange={(e) => setReceiveLotClassification(e.target.value as "class_a"|"class_b"|"")}
                    disabled={!canReceive}
                  >
                    <option value="">— Non classifié</option>
                    <option value="class_a">Classe A — Propre, isolation</option>
                    <option value="class_b">Classe B — Très souillée, engrais/compostage</option>
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Température du tas (°C)">
                  <Input type="number" step="0.1" value={receiveStackTempC}
                    onChange={(e) => setReceiveStackTempC(e.target.value)}
                    disabled={!canReceive} placeholder="Auto-combustion si > 60°C" />
                </WorkflowField>
                <WorkflowField label="Taux d'humidité H% (entrée)">
                  <Input type="number" step="0.1" min="0" max="100" value={receiveHumidityEntry}
                    onChange={(e) => setReceiveHumidityEntry(e.target.value)}
                    disabled={!canReceive} placeholder="Isolation : doit être < 15%" />
                </WorkflowField>
                <WorkflowField label="Taux matières végétales VM%">
                  <Input type="number" step="0.1" min="0" max="100" value={receiveVegetalMatter}
                    onChange={(e) => setReceiveVegetalMatter(e.target.value)}
                    disabled={!canReceive} placeholder="> 5% → engrais" />
                </WorkflowField>
                <WorkflowField label="Date de sortie prévue">
                  <Input type="date" value={receivePlannedExit}
                    onChange={(e) => setReceivePlannedExit(e.target.value)}
                    disabled={!canReceive} />
                </WorkflowField>

                <Button
                  className="w-full"
                  onClick={() => void handleReceive()}
                  disabled={!canReceive || submitting === "receive"}
                >
                  {submitting === "receive" ? "Enregistrement..." : "Valider E1"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>S1 Audit de sortie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Lot prêt">
                  <WorkflowSelect
                    value={dispatchLotId}
                    onChange={(event) => {
                      const lotId = event.target.value;
                      setDispatchLotId(lotId);
                      const lot = data.dispatchQueue.find((item) => item.id === lotId);
                      const depot =
                        data.depots.find((item) => item.name === lot?.depotName) ??
                        data.depots[0];
                      setDispatchDepotId(depot?.id ?? "");
                      setDispatchWeightKg(String(toNumber(lot?.weightKg)));
                    }}
                    disabled={!canDispatch}
                  >
                    <option value="">Sélectionner un lot</option>
                    {data.dispatchQueue.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.qrCode} · {lot.depotName ?? "Dépôt"}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Dépôt de sortie">
                  <WorkflowSelect
                    value={dispatchDepotId}
                    onChange={(event) => setDispatchDepotId(event.target.value)}
                    disabled={!canDispatch}
                  >
                    <option value="">Sélectionner un dépôt</option>
                    {data.depots.map((depot) => (
                      <option key={depot.id} value={depot.id}>
                        {depot.name}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                {/* Stage 4 — Segmentation du flux */}
                <WorkflowField label="Destination">
                  <WorkflowSelect
                    value={dispatchDestinationType}
                    onChange={(e) => setDispatchDestinationType(e.target.value as "laverie"|"transformer_direct")}
                    disabled={!canDispatch}
                  >
                    <option value="laverie">Laverie (Flux A — isolation/engrais propre)</option>
                    <option value="transformer_direct">Transformateur direct (Flux B — engrais brut)</option>
                  </WorkflowSelect>
                </WorkflowField>
                {dispatchDestinationType === "laverie" && (
                  <WorkflowField label="Laverie cible">
                    <WorkflowSelect
                      value={dispatchLaverieId}
                      onChange={(event) => setDispatchLaverieId(event.target.value)}
                      disabled={!canDispatch}
                    >
                      <option value="">Sélectionner une laverie</option>
                      {data.laveries.map((laverie) => (
                        <option key={laverie.id} value={laverie.id}>
                          {laverie.name} · {laverie.regionName ?? "—"}
                        </option>
                      ))}
                    </WorkflowSelect>
                  </WorkflowField>
                )}
                <WorkflowField label="Poids manifeste (kg)">
                  <Input type="number" min="0" step="0.01" value={dispatchWeightKg}
                    onChange={(event) => setDispatchWeightKg(event.target.value)}
                    disabled={!canDispatch} />
                </WorkflowField>
                <WorkflowField label="Volume Flux A — Isolation (kg)">
                  <Input type="number" min="0" step="0.01" value={dispatchFluxAKg}
                    onChange={(e) => setDispatchFluxAKg(e.target.value)}
                    disabled={!canDispatch} placeholder="Laine longue, saine" />
                </WorkflowField>
                <WorkflowField label="Volume Flux B — Engrais (kg)">
                  <Input type="number" min="0" step="0.01" value={dispatchFluxBKg}
                    onChange={(e) => setDispatchFluxBKg(e.target.value)}
                    disabled={!canDispatch} placeholder="Laine jarreuse, très souillée" />
                </WorkflowField>
                <WorkflowField label="Taux d'impuretés VM%">
                  <Input type="number" min="0" max="100" step="0.1" value={dispatchImpurityRate}
                    onChange={(e) => setDispatchImpurityRate(e.target.value)}
                    disabled={!canDispatch} placeholder="> 5% → engrais direct" />
                </WorkflowField>
                <WorkflowField label="Degré d'humidité H% (sortie)">
                  <Input type="number" min="0" max="100" step="0.1" value={dispatchHumidityExit}
                    onChange={(e) => setDispatchHumidityExit(e.target.value)}
                    disabled={!canDispatch} placeholder="Mesurer avant transport" />
                </WorkflowField>

                <Button
                  className="w-full"
                  onClick={() => void handleDispatch()}
                  disabled={!canDispatch || submitting === "dispatch"}
                >
                  {submitting === "dispatch" ? "Génération..." : "Déclencher S1"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DataTableCard
              title="Queue entrée dépôt"
              description="Lots qui arrivent du terrain et attendent une validation E1."
              rows={data.intakeQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun lot en attente de réception."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.qrCode,
                },
                {
                  header: "Source",
                  render: (row) => formatEnumLabel(row.sourceType),
                },
                {
                  header: "Statut",
                  render: (row) => <StatusBadge value={row.status} />,
                },
                {
                  header: "Poids déclaré",
                  render: (row) => formatWeight(row.actualWeightKg ?? row.declaredWeightKg),
                },
                {
                  header: "Collecté",
                  render: (row) => formatDateTime(row.collectedAt),
                },
              ]}
            />

            <DataTableCard
              title="Queue sortie dépôt"
              description="Lots stockés ou pré-triés prêts pour S1 vers la laverie."
              rows={data.dispatchQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun lot prêt pour une sortie dépôt."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.qrCode,
                },
                {
                  header: "Zone",
                  render: (row) => row.zoneCode ?? "—",
                },
                {
                  header: "Urgence",
                  render: (row) => <StatusBadge value={row.urgency ?? "normal"} />,
                },
                {
                  header: "Poids",
                  render: (row) => formatWeight(row.weightKg),
                },
                {
                  header: "Statut",
                  render: (row) => <StatusBadge value={row.status} />,
                },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DataTableCard
              title="Réceptions récentes"
              rows={data.recentReceptions}
              getRowKey={(row) => row.id}
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.lotQrCode ?? "—",
                },
                {
                  header: "Dépôt",
                  render: (row) => row.depotName ?? "—",
                },
                {
                  header: "Zone",
                  render: (row) => row.zoneCode ?? "—",
                },
                {
                  header: "Écart",
                  render: (row) => formatWeight(row.discrepancyKg),
                },
                {
                  header: "Heure",
                  render: (row) => formatDateTime(row.receivedAt),
                },
              ]}
            />

            <DataTableCard
              title="Alertes A1"
              rows={data.recentAlerts}
              getRowKey={(row) => row.id}
              columns={[
                {
                  header: "Dépôt",
                  render: (row) => row.depotName ?? "—",
                },
                {
                  header: "Sévérité",
                  render: (row) => <StatusBadge value={row.severity} />,
                },
                {
                  header: "Statut",
                  render: (row) => <StatusBadge value={row.status} />,
                },
                {
                  header: "Déclenchée",
                  render: (row) => formatDateTime(row.firedAt),
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </OperationsPageShell>
  );
}
