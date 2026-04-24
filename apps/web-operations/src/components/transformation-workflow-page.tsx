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
} from "@/components/workflow-form-controls";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  completeProductionRun,
  getTransformationOverview,
  startProductionRun,
  type TransformationOverviewResponse,
} from "@/lib/api";
import {
  formatDateTime,
  formatEnumLabel,
  formatNumber,
  formatWeight,
  toNumber,
} from "@/lib/format";

export function TransformationWorkflowPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("transformation.view");
  const canOperate = hasPermission("transformation.operate");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"default" | "destructive" | "success">(
    "default",
  );
  const [submitting, setSubmitting] = useState<"start" | "complete" | null>(null);
  const { data, error, loading, refresh, updatedAt } =
    useAsyncData<TransformationOverviewResponse>(
      () => {
        if (!session || !canViewPage) {
          return Promise.resolve(null);
        }

        return getTransformationOverview();
      },
      [session?.user.id, canViewPage],
    );

  const [lotId, setLotId] = useState("");
  const [transformerId, setTransformerId] = useState("");
  const [bomId, setBomId] = useState("");
  const [inputWeightKg, setInputWeightKg] = useState("");

  const [runId, setRunId] = useState("");
  const [outputWeightKg, setOutputWeightKg] = useState("");
  const [wasteWeightKg, setWasteWeightKg] = useState("0");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("unités");
  const [productCode, setProductCode] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    const queueLot = data.dispatchQueue[0];
    const queueTransformer =
      data.transformers.find((item) => item.id === queueLot?.transformerId) ?? data.transformers[0];
    const queueBom =
      data.boms.find((item) => item.transformerId === queueTransformer?.id) ?? data.boms[0];

    setLotId((value) => value || queueLot?.id || "");
    setTransformerId((value) => value || queueTransformer?.id || "");
    setBomId((value) => value || queueBom?.id || "");
    setInputWeightKg((value) => value || String(toNumber(queueLot?.weightKg)));

    const activeRun = data.activeRuns[0];
    setRunId((value) => value || activeRun?.id || "");
    setOutputWeightKg((value) =>
      value
        ? value
        : activeRun
          ? String(toNumber(activeRun.outputWeightKg || activeRun.inputWeightKg))
          : "",
    );
    setQuantity((value) => value || "1");
  }, [data]);

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Transformateurs",
          value: formatNumber(data.summary.totalTransformers),
          helper: `${formatNumber(data.summary.activeTransformers)} actifs`,
        },
        {
          label: "Runs actifs",
          value: formatNumber(data.summary.activeRuns),
          helper: `${formatNumber(data.dispatchQueue.length)} lots dispatchables`,
        },
        {
          label: "Runs totaux",
          value: formatNumber(data.summary.totalRuns),
        },
        {
          label: "Produits récents",
          value: formatNumber(data.summary.recentProducts),
        },
      ]
    : undefined;

  const filteredBoms = data?.boms.filter((bom) => bom.transformerId === transformerId) ?? [];

  async function handleStartRun() {
    if (!lotId || !transformerId || !bomId || !inputWeightKg) {
      setFeedback("Sélectionne un lot dispatché, un transformateur, un BOM et un poids.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("start");
    setFeedback(null);

    const result = await startProductionRun({
      transformerId,
      lotId,
      bomId,
      inputWeightKg: Number(inputWeightKg),
    });

    if (!result) {
      setFeedback("Impossible de démarrer le run de transformation.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Run ${result.id} démarré pour le lot ${result.lotId}.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  async function handleCompleteRun() {
    if (!runId || !outputWeightKg || !wasteWeightKg || !quantity) {
      setFeedback("Complète le run, la sortie, le déchet et la quantité produit.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting("complete");
    setFeedback(null);

    const result = await completeProductionRun(runId, {
      outputWeightKg: Number(outputWeightKg),
      wasteWeightKg: Number(wasteWeightKg),
      quantity: Number(quantity),
      unit,
      productCode: productCode || undefined,
    });

    if (!result) {
      setFeedback("Impossible de clôturer le run et générer le produit.");
      setFeedbackTone("destructive");
      setSubmitting(null);
      return;
    }

    setFeedback(`Produit ${result.productCode} créé avec certification en attente.`);
    setFeedbackTone("success");
    setSubmitting(null);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Transformation D3 / D4"
      description="Démarrage des runs industriels, clôture BOM, sortie produit et génération du flux vers certification."
      requiredPermissions={["transformation.view"]}
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
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Démarrer un run</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Lot dispatché">
                  <WorkflowSelect
                    value={lotId}
                    onChange={(event) => {
                      const nextLotId = event.target.value;
                      setLotId(nextLotId);
                      const queueLot = data.dispatchQueue.find((item) => item.id === nextLotId);
                      setTransformerId(queueLot?.transformerId ?? "");
                      setInputWeightKg(String(toNumber(queueLot?.weightKg)));
                    }}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un lot</option>
                    {data.dispatchQueue.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.qrCode} · {formatEnumLabel(row.status)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Transformateur">
                  <WorkflowSelect
                    value={transformerId}
                    onChange={(event) => {
                      const nextTransformerId = event.target.value;
                      setTransformerId(nextTransformerId);
                      const nextBom = data.boms.find(
                        (item) => item.transformerId === nextTransformerId,
                      );
                      setBomId(nextBom?.id ?? "");
                    }}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un transformateur</option>
                    {data.transformers.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.name} · {formatEnumLabel(row.track)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="BOM actif">
                  <WorkflowSelect
                    value={bomId}
                    onChange={(event) => setBomId(event.target.value)}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un BOM</option>
                    {filteredBoms.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.productName} · v{row.version}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Poids entrée (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputWeightKg}
                    onChange={(event) => setInputWeightKg(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <Button
                  onClick={() => void handleStartRun()}
                  disabled={!canOperate || submitting === "start"}
                >
                  {submitting === "start" ? "Démarrage..." : "Démarrer"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clôturer un run</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Run actif">
                  <WorkflowSelect
                    value={runId}
                    onChange={(event) => {
                      const nextRunId = event.target.value;
                      setRunId(nextRunId);
                      const nextRun = data.activeRuns.find((item) => item.id === nextRunId);
                      setOutputWeightKg(String(toNumber(nextRun?.outputWeightKg || nextRun?.inputWeightKg)));
                    }}
                    disabled={!canOperate}
                  >
                    <option value="">Sélectionner un run</option>
                    {data.activeRuns.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.id} · {row.transformerName ?? "Transformateur"}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Poids sortie (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={outputWeightKg}
                    onChange={(event) => setOutputWeightKg(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Déchets (kg)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={wasteWeightKg}
                    onChange={(event) => setWasteWeightKg(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Quantité produite">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Unité">
                  <Input
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    disabled={!canOperate}
                  />
                </WorkflowField>
                <WorkflowField label="Code produit (optionnel)">
                  <Input
                    value={productCode}
                    onChange={(event) => setProductCode(event.target.value)}
                    disabled={!canOperate}
                    placeholder="P1-AUTO-0004"
                  />
                </WorkflowField>
                <Button
                  onClick={() => void handleCompleteRun()}
                  disabled={!canOperate || submitting === "complete"}
                >
                  {submitting === "complete" ? "Clôture..." : "Clôturer le run"}
                </Button>
              </CardContent>
            </Card>

            <InfoListCard
              title="Capacités transformation"
              items={[
                {
                  label: "Opérations atelier",
                  value: canOperate ? "Actives" : "Lecture seule",
                  tone: canOperate ? "success" : "warning",
                },
                {
                  label: "Lots dispatchés",
                  value: formatNumber(data.dispatchQueue.length),
                },
                {
                  label: "Runs actifs",
                  value: formatNumber(data.activeRuns.length),
                },
                {
                  label: "BOMs actifs",
                  value: formatNumber(data.boms.length),
                },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DataTableCard
              title="Lots en attente atelier"
              rows={data.dispatchQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun lot dispatché vers les transformateurs."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.qrCode,
                },
                {
                  header: "Track",
                  render: (row) => formatEnumLabel(row.track),
                },
                {
                  header: "Transformateur",
                  render: (row) => row.transformerName ?? "—",
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

            <DataTableCard
              title="Runs actifs"
              rows={data.activeRuns}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun run actif."
              columns={[
                {
                  header: "Run",
                  render: (row) => row.id,
                },
                {
                  header: "Transformateur",
                  render: (row) => row.transformerName ?? "—",
                },
                {
                  header: "Entrée",
                  render: (row) => formatWeight(row.inputWeightKg),
                },
                {
                  header: "Début",
                  render: (row) => formatDateTime(row.startedAt),
                },
              ]}
            />
          </div>

          <DataTableCard
            title="Produits récents"
            rows={data.recentProducts}
            getRowKey={(row) => row.id}
            columns={[
              {
                header: "Code",
                render: (row) => row.productCode,
              },
              {
                header: "Type",
                render: (row) => row.productTypeCode,
              },
              {
                header: "Track",
                render: (row) => formatEnumLabel(row.track),
              },
              {
                header: "Poids",
                render: (row) => formatWeight(row.weightKg),
              },
              {
                header: "Statut",
                render: (row) => <StatusBadge value={row.status} />,
              },
              {
                header: "Créé",
                render: (row) => formatDateTime(row.createdAt),
              },
            ]}
          />
        </>
      ) : null}
    </OperationsPageShell>
  );
}
