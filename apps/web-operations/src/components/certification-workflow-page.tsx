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
  getCertificationOverview,
  issueCertification,
  revokeCertification,
  type CertificationOverviewResponse,
} from "@/lib/api";
import { formatDateTime, formatEnumLabel, formatNumber } from "@/lib/format";

function formatGateProgress(gatesPassed: Record<string, boolean> | null) {
  if (!gatesPassed) {
    return "—";
  }

  const values = Object.values(gatesPassed);
  return `${values.filter(Boolean).length}/${values.length}`;
}

export function CertificationWorkflowPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("certification.view");
  const canManage = hasPermission("certification.manage");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"default" | "destructive" | "success">(
    "default",
  );
  const [submitting, setSubmitting] = useState(false);
  const { data, error, loading, refresh, updatedAt } =
    useAsyncData<CertificationOverviewResponse>(
      () => {
        if (!session || !canViewPage) {
          return Promise.resolve(null);
        }

        return getCertificationOverview();
      },
      [session?.user.id, canViewPage],
    );

  const [certificationId, setCertificationId] = useState("");
  const [mode, setMode] = useState<"issue" | "revoke">("issue");
  const [forceIssue, setForceIssue] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  useEffect(() => {
    if (!data || certificationId) {
      return;
    }

    const pending = data.certifications.find((item) => item.status === "pending");
    const issued = data.certifications.find((item) => item.status === "issued");
    const target = pending ?? issued ?? data.certifications[0];

    if (!target) {
      return;
    }

    setCertificationId(target.id);
    setMode(target.status === "issued" ? "revoke" : "issue");
    setRevokeReason(target.revokedReason ?? "");
  }, [data, certificationId]);

  const selectedCertification =
    data?.certifications.find((item) => item.id === certificationId) ?? null;

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Certifications",
          value: formatNumber(data.summary.totalCertifications),
        },
        {
          label: "En attente",
          value: formatNumber(data.summary.pending),
        },
        {
          label: "Émises",
          value: formatNumber(data.summary.issued),
        },
        {
          label: "Révoquées",
          value: formatNumber(data.summary.revoked),
        },
      ]
    : undefined;

  async function handleSubmit() {
    if (!selectedCertification) {
      setFeedback("Sélectionne une certification.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const result =
      mode === "issue"
        ? await issueCertification(selectedCertification.id, { force: forceIssue })
        : await revokeCertification(selectedCertification.id, {
            reason: revokeReason || "Révocation opérateur",
          });

    if (!result) {
      setFeedback("Impossible de mettre à jour la certification.");
      setFeedbackTone("destructive");
      setSubmitting(false);
      return;
    }

    setFeedback(
      `Certification ${result.productCode} passée en ${formatEnumLabel(result.status)}.`,
    );
    setFeedbackTone("success");
    setSubmitting(false);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Certification NFN"
      description="Émission ou révocation du sceau NFN à partir des gates du workflow industriel."
      requiredPermissions={["certification.view"]}
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
          <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Action certification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <WorkflowField label="Certification">
                  <WorkflowSelect
                    value={certificationId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setCertificationId(nextId);
                      const nextCertification = data.certifications.find(
                        (item) => item.id === nextId,
                      );
                      setMode(nextCertification?.status === "issued" ? "revoke" : "issue");
                      setRevokeReason(nextCertification?.revokedReason ?? "");
                    }}
                    disabled={!canManage}
                  >
                    <option value="">Sélectionner une certification</option>
                    {data.certifications.map((certification) => (
                      <option key={certification.id} value={certification.id}>
                        {certification.productCode} · {formatEnumLabel(certification.status)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Action">
                  <WorkflowSelect
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as "issue" | "revoke")
                    }
                    disabled={!canManage}
                  >
                    {selectedCertification?.status !== "issued" ? (
                      <option value="issue">Issue</option>
                    ) : null}
                    {selectedCertification?.status === "issued" ? (
                      <option value="revoke">Revoke</option>
                    ) : null}
                  </WorkflowSelect>
                </WorkflowField>
                {mode === "issue" ? (
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Input
                      type="checkbox"
                      checked={forceIssue}
                      onChange={(event) => setForceIssue(event.target.checked)}
                      className="h-4 w-4"
                      disabled={!canManage}
                    />
                    Forcer l’émission si une gate reste ouverte
                  </label>
                ) : null}
                {mode === "revoke" ? (
                  <WorkflowField label="Motif de révocation">
                    <Input
                      value={revokeReason}
                      onChange={(event) => setRevokeReason(event.target.value)}
                      disabled={!canManage}
                      placeholder="Erreur d’étiquetage, contamination..."
                    />
                  </WorkflowField>
                ) : null}
                <Button onClick={() => void handleSubmit()} disabled={!canManage || submitting}>
                  {submitting ? "Traitement..." : "Appliquer"}
                </Button>
              </CardContent>
            </Card>

            <InfoListCard
              title="Synthèse certification"
              items={[
                {
                  label: "Autorité d'émission",
                  value: canManage ? "Active" : "Lecture seule",
                  tone: canManage ? "success" : "warning",
                },
                {
                  label: "Pending",
                  value: formatNumber(data.summary.pending),
                },
                {
                  label: "Issued",
                  value: formatNumber(data.summary.issued),
                },
                {
                  label: "Revoked",
                  value: formatNumber(data.summary.revoked),
                },
              ]}
            />
          </div>

          <DataTableCard
            title="Registre de certification"
            rows={data.certifications}
            getRowKey={(row) => row.id}
            columns={[
              {
                header: "Produit",
                render: (row) => row.productCode,
              },
              {
                header: "Statut",
                render: (row) => <StatusBadge value={row.status} />,
              },
              {
                header: "Gates",
                render: (row) => formatGateProgress(row.gatesPassed),
              },
              {
                header: "Émise",
                render: (row) => formatDateTime(row.issuedAt),
              },
              {
                header: "Révoquée",
                render: (row) => formatDateTime(row.revokedAt),
              },
              {
                header: "Motif",
                render: (row) => row.revokedReason ?? "—",
              },
            ]}
          />
        </>
      ) : null}
    </OperationsPageShell>
  );
}
