"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import { DataTableCard } from "@/components/data-table-card";
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
import { useAsyncData } from "@/hooks/use-async-data";
import {
  createLaverieQualification,
  createLaverieReception,
  getLaverieOverview,
  startWashingRun,
  type LaverieOverviewResponse,
} from "@/lib/api";
import {
  formatDateTime,
  formatEnumLabel,
  formatNumber,
  formatWeight,
  toNumber,
} from "@/lib/format";

export function LaverieWorkflowPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("laverie.view");
  const canOperate = hasPermission("laverie.operate");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"default" | "destructive" | "success">(
    "default",
  );
  const [submitting, setSubmitting] = useState<"receive" | "wash" | "qualify" | null>(
    null,
  );
  const { data, error, loading, refresh, updatedAt } = useAsyncData<LaverieOverviewResponse>(
    () => {
      if (!session || !canViewPage) {
        return Promise.resolve(null);
      }

      return getLaverieOverview();
    },
    [session?.user.id, canViewPage],
  );

  const [receiveLotId, setReceiveLotId] = useState("");
  const [receiveLaverieId, setReceiveLaverieId] = useState("");
  const [receiveWeightKg, setReceiveWeightKg] = useState("");

  const [washLotId, setWashLotId] = useState("");
  const [washLaverieId, setWashLaverieId] = useState("");
  const [washWeightKg, setWashWeightKg] = useState("");
  const [waterLiters, setWaterLiters] = useState("");
  const [waterTempC, setWaterTempC] = useState("");
  const [cycleDurationMinutes, setCycleDurationMinutes] = useState("");

  const [qualificationRunId, setQualificationRunId] = useState("");
  const [cleanWeightKg, setCleanWeightKg] = useState("");
  const [grade, setGrade] = useState<"A" | "B" | "C" | "reject">("A");
  const [safetyStatus, setSafetyStatus] = useState<"clear" | "flagged" | "rejected">(
    "clear",
  );
  const [fiberLengthMm, setFiberLengthMm] = useState("");
  const [fiberDiameterMicron, setFiberDiameterMicron] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [cleanlinessScore, setCleanlinessScore] = useState("");
  const [color, setColor] = useState("");
  const [dispatchTrack, setDispatchTrack] = useState<
    "d3_textile" | "d4_bio" | "quarantine" | "reject"
  >("d3_textile");
  const [targetTransformerId, setTargetTransformerId] = useState("");
  const [contaminationNotes, setContaminationNotes] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    const reception = data.receptionQueue[0];
    const wash = data.washQueue[0];
    const qualification = data.qualificationQueue[0];
    const firstLaverie = data.laveries[0];

    setReceiveLotId((value) => value || reception?.id || "");
    setReceiveLaverieId((value) => value || reception?.laverieId || firstLaverie?.id || "");
    setReceiveWeightKg((value) => value || String(toNumber(reception?.weightKg)));

    setWashLotId((value) => value || wash?.id || "");
    setWashLaverieId((value) => value || wash?.laverieId || firstLaverie?.id || "");
    setWashWeightKg((value) => value || String(toNumber(wash?.weightKg)));

    setQualificationRunId((value) => value || qualification?.id || "");
    setCleanWeightKg((value) =>
      value
        ? value
        : qualification
          ? String(
              toNumber(qualification.cleanWeightKg || qualification.dirtyWeightKg),
            )
          : "",
    );
    setTargetTransformerId((value) => value || data.transformers[0]?.id || "");
  }, [data]);

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Laveries",
          value: formatNumber(data.summary.totalLaveries),
          helper: `${formatNumber(data.summary.activeLaveries)} actives`,
        },
        {
          label: "Runs actifs",
          value: formatNumber(data.summary.activeRuns),
        },
        {
          label: "Réceptions à traiter",
          value: formatNumber(data.receptionQueue.length),
        },
        {
          label: "Qualifications",
          value: formatNumber(data.summary.gradedLots),
          helper: `${formatNumber(data.qualificationQueue.length)} runs à clôturer`,
        },
      ]
    : undefined;

  async function handleReceive() {
    if (!receiveLotId || !receiveLaverieId || !receiveWeightKg) {
      setFeedback("Complète la réception laverie avant validation.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("receive");
    setFeedback(null);

    const result = await createLaverieReception({
      laverieId: receiveLaverieId,
      lotId: receiveLotId,
      receivedWeightKg: Number(receiveWeightKg),
    });

    if (!result) {
      setFeedback("Impossible d'enregistrer la réception laverie.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Lot ${result.lotId} reçu en laverie.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  async function handleStartWash() {
    if (!washLotId || !washLaverieId || !washWeightKg) {
      setFeedback("Sélectionne un lot reçu et un poids d'entrée wash.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("wash");
    setFeedback(null);

    const result = await startWashingRun({
      laverieId: washLaverieId,
      lotId: washLotId,
      dirtyWeightKg: Number(washWeightKg),
      waterLiters: waterLiters ? Number(waterLiters) : undefined,
      waterTempC: waterTempC ? Number(waterTempC) : undefined,
      cycleDurationMinutes: cycleDurationMinutes
        ? Number(cycleDurationMinutes)
        : undefined,
    });

    if (!result) {
      setFeedback("Impossible de démarrer le cycle de lavage.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Run ${result.id} démarré pour le lot ${result.lotId}.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  async function handleQualify() {
    if (!qualificationRunId || !cleanWeightKg) {
      setFeedback("Sélectionne un run et renseigne le poids propre.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("qualify");
    setFeedback(null);

    const result = await createLaverieQualification({
      washingRunId: qualificationRunId,
      cleanWeightKg: Number(cleanWeightKg),
      grade,
      safetyStatus,
      fiberLengthMm: fiberLengthMm ? Number(fiberLengthMm) : undefined,
      fiberDiameterMicron: fiberDiameterMicron
        ? Number(fiberDiameterMicron)
        : undefined,
      moisturePercent: moisturePercent ? Number(moisturePercent) : undefined,
      cleanlinessScore: cleanlinessScore ? Number(cleanlinessScore) : undefined,
      color: color || undefined,
      contaminationNotes: contaminationNotes || undefined,
      dispatchTrack,
      targetTransformerId:
        dispatchTrack === "d3_textile" || dispatchTrack === "d4_bio"
          ? targetTransformerId || undefined
          : undefined,
    });

    if (!result) {
      setFeedback("Impossible de clôturer la qualification et le dispatch S2/S3.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Qualification terminée. Lot routé en ${formatEnumLabel(result.status)}.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Laverie D2"
      description="Réception laverie, démarrage wash, qualification, pricing et routage S2/S3 vers D3 ou D4."
      requiredPermissions={["laverie.view"]}
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
          <div className="grid gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Réception laverie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Lot dispatché">
                  <WorkflowSelect
                    value={receiveLotId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setReceiveLotId(nextId);
                      const nextLot = data.receptionQueue.find((item) => item.id === nextId);
                      setReceiveLaverieId(nextLot?.laverieId ?? data.laveries[0]?.id ?? "");
                      setReceiveWeightKg(String(toNumber(nextLot?.weightKg)));
                    }}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un lot</option>
                    {data.receptionQueue.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.qrCode} · {row.laverieName ?? "Laverie"}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Laverie">
                  <WorkflowSelect
                    value={receiveLaverieId}
                    onChange={(event) => setReceiveLaverieId(event.target.value)}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner une laverie</option>
                    {data.laveries.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.name}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Poids reçu (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={receiveWeightKg}
                    onChange={(event) => setReceiveWeightKg(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <Button onClick={() => void handleReceive()} disabled={!canOperate || submitting === "receive"}>
                  {submitting === "receive" ? "Réception..." : "Valider la réception"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Démarrer le lavage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Lot reçu">
                  <WorkflowSelect
                    value={washLotId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setWashLotId(nextId);
                      const nextLot = data.washQueue.find((item) => item.id === nextId);
                      setWashLaverieId(nextLot?.laverieId ?? data.laveries[0]?.id ?? "");
                      setWashWeightKg(String(toNumber(nextLot?.weightKg)));
                    }}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un lot</option>
                    {data.washQueue.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.qrCode} · {row.laverieName ?? "Laverie"}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Laverie">
                  <WorkflowSelect
                    value={washLaverieId}
                    onChange={(event) => setWashLaverieId(event.target.value)}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner une laverie</option>
                    {data.laveries.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.name}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Poids sale (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={washWeightKg}
                    onChange={(event) => setWashWeightKg(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Eau (L)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={waterLiters}
                    onChange={(event) => setWaterLiters(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Température eau (°C)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={waterTempC}
                    onChange={(event) => setWaterTempC(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Durée cycle (min)">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={cycleDurationMinutes}
                    onChange={(event) => setCycleDurationMinutes(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <Button onClick={() => void handleStartWash()} disabled={!canOperate || submitting === "wash"}>
                  {submitting === "wash" ? "Démarrage..." : "Démarrer le wash"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualification & dispatch S2/S3</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Run à clôturer">
                  <WorkflowSelect
                    value={qualificationRunId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setQualificationRunId(nextId);
                      const nextRun = data.qualificationQueue.find((item) => item.id === nextId);
                      setCleanWeightKg(
                        String(
                          toNumber(nextRun?.cleanWeightKg || nextRun?.dirtyWeightKg),
                        ),
                      );
                    }}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un run</option>
                    {data.qualificationQueue.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.lotQrCode ?? row.id} · {row.laverieName ?? "Laverie"}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Poids propre (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cleanWeightKg}
                    onChange={(event) => setCleanWeightKg(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <div className="grid gap-3 md:grid-cols-2">
                  <WorkflowField label="Grade">
                    <WorkflowSelect
                      value={grade}
                      onChange={(event) =>
                        setGrade(event.target.value as "A" | "B" | "C" | "reject")
                      }
                      disabled={!canOperate}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="reject">Reject</option>
                    </WorkflowSelect>
                  </WorkflowField>
                  <WorkflowField label="Safety">
                    <WorkflowSelect
                      value={safetyStatus}
                      onChange={(event) =>
                        setSafetyStatus(
                          event.target.value as "clear" | "flagged" | "rejected",
                        )
                      }
                      disabled={!canOperate}
                    >
                      <option value="clear">Clear</option>
                      <option value="flagged">Flagged</option>
                      <option value="rejected">Rejected</option>
                    </WorkflowSelect>
                  </WorkflowField>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <WorkflowField label="Longueur fibre (mm)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fiberLengthMm}
                      onChange={(event) => setFiberLengthMm(event.target.value)}
                      disabled={!canOperate}
                    />
                  </WorkflowField>
                  <WorkflowField label="Diamètre fibre (µm)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fiberDiameterMicron}
                      onChange={(event) => setFiberDiameterMicron(event.target.value)}
                      disabled={!canOperate}
                    />
                  </WorkflowField>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <WorkflowField label="Humidité (%)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={moisturePercent}
                      onChange={(event) => setMoisturePercent(event.target.value)}
                      disabled={!canOperate}
                    />
                  </WorkflowField>
                  <WorkflowField label="Cleanliness score">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={cleanlinessScore}
                      onChange={(event) => setCleanlinessScore(event.target.value)}
                      disabled={!canOperate}
                    />
                  </WorkflowField>
                </div>
                <WorkflowField label="Couleur">
                  <Input
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    disabled={!canOperate}
                    placeholder="blanc cassé"
                  />
                </WorkflowField>
                <WorkflowField label="Dispatch track">
                  <WorkflowSelect
                    value={dispatchTrack}
                    onChange={(event) =>
                      setDispatchTrack(
                        event.target.value as
                          | "d3_textile"
                          | "d4_bio"
                          | "quarantine"
                          | "reject",
                      )
                    }
                    disabled={!canOperate}
                  >
                    <option value="d3_textile">D3 Textile</option>
                    <option value="d4_bio">D4 Bio</option>
                    <option value="quarantine">Quarantine</option>
                    <option value="reject">Reject</option>
                  </WorkflowSelect>
                </WorkflowField>
                {(dispatchTrack === "d3_textile" || dispatchTrack === "d4_bio") && (
                  <WorkflowField label="Transformateur cible">
                    <WorkflowSelect
                      value={targetTransformerId}
                      onChange={(event) => setTargetTransformerId(event.target.value)}
                      disabled={!canOperate}
                    >
                      <option value="">Sélectionner un transformateur</option>
                      {data.transformers
                        .filter((row) =>
                          dispatchTrack === "d3_textile"
                            ? row.track === "d3_textile"
                            : row.track === "d4_bio",
                        )
                        .map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.name}
                          </option>
                        ))}
                    </WorkflowSelect>
                  </WorkflowField>
                )}
                <WorkflowField label="Notes contamination">
                  <WorkflowTextarea
                    value={contaminationNotes}
                    onChange={(event) => setContaminationNotes(event.target.value)}
                    disabled={!canOperate}
                    placeholder="Résidus chimiques, fragments, quarantaine..."
                  />
                </WorkflowField>
                <Button
                  onClick={() => void handleQualify()}
                  disabled={!canOperate || submitting === "qualify"}
                >
                  {submitting === "qualify" ? "Clôture..." : "Clôturer le run"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <DataTableCard
              title="Réceptions attendues"
              rows={data.receptionQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun lot en attente de réception laverie."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.qrCode,
                },
                {
                  header: "Laverie",
                  render: (row) => row.laverieName ?? "—",
                },
                {
                  header: "Urgence",
                  render: (row) => <StatusBadge value={row.urgency ?? "normal"} />,
                },
                {
                  header: "Poids",
                  render: (row) => formatWeight(row.weightKg),
                },
              ]}
            />

            <DataTableCard
              title="Lots reçus à lancer"
              rows={data.washQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun lot reçu en attente de wash."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.qrCode,
                },
                {
                  header: "Laverie",
                  render: (row) => row.laverieName ?? "—",
                },
                {
                  header: "Poids",
                  render: (row) => formatWeight(row.weightKg),
                },
                {
                  header: "Reçu",
                  render: (row) => formatDateTime(row.receivedAt),
                },
              ]}
            />

            <DataTableCard
              title="Runs à qualifier"
              rows={data.qualificationQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun run en attente de qualification."
              columns={[
                {
                  header: "Run",
                  render: (row) => row.id,
                },
                {
                  header: "Lot",
                  render: (row) => row.lotQrCode ?? "—",
                },
                {
                  header: "Entrée",
                  render: (row) => formatWeight(row.dirtyWeightKg),
                },
                {
                  header: "Début",
                  render: (row) => formatDateTime(row.startedAt),
                },
              ]}
            />
          </div>

          <DataTableCard
            title="Qualifications récentes"
            rows={data.recentQualifications}
            getRowKey={(row) => row.id}
            columns={[
              {
                header: "Lot",
                render: (row) => row.lotId,
              },
              {
                header: "Grade",
                render: (row) => <StatusBadge value={row.grade} />,
              },
              {
                header: "Safety",
                render: (row) => <StatusBadge value={row.safetyStatus} />,
              },
              {
                header: "Fibre",
                render: (row) =>
                  `${toNumber(row.fiberLengthMm)} mm / ${toNumber(
                    row.fiberDiameterMicron,
                  )} µm`,
              },
              {
                header: "Analyste",
                render: (row) => row.analystName ?? "—",
              },
              {
                header: "Date",
                render: (row) => formatDateTime(row.performedAt),
              },
            ]}
          />
        </>
      ) : null}
    </OperationsPageShell>
  );
}
