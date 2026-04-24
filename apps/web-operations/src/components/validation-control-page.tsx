"use client";

import { useState } from "react";
import { Button } from "@ba33/ui-web";
import { DataTableCard } from "@/components/data-table-card";
import { InfoListCard } from "@/components/info-list-card";
import {
  type OperationsMetric,
  OperationsPageShell,
} from "@/components/operations-page-shell";
import { StatusBadge } from "@/components/status-badge";
import { useSession } from "@/components/session-provider";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  getValidationOverview,
  updateA1AlertStatus,
  type ValidationOverviewResponse,
} from "@/lib/api";
import {
  formatDateTime,
  formatEnumLabel,
  formatNumber,
  formatWeight,
} from "@/lib/format";

function formatGateProgress(gatesPassed: Record<string, boolean> | null) {
  if (!gatesPassed) {
    return "—";
  }

  const values = Object.values(gatesPassed);
  return `${values.filter(Boolean).length}/${values.length}`;
}

export function ValidationControlPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("validation.view");
  const canManageAlerts = hasPermission("alerts.manage");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingAlertId, setSavingAlertId] = useState<string | null>(null);
  const { data, error, loading, refresh, updatedAt } =
    useAsyncData<ValidationOverviewResponse>(
      () => {
        if (!session || !canViewPage) {
          return Promise.resolve(null);
        }

        return getValidationOverview();
      },
      [session?.user.id, canViewPage],
    );

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "A1 ouverts",
          value: formatNumber(data.summary.openA1Alerts),
          helper: "Alertes dépôt à arbitrer",
        },
        {
          label: "Écarts de poids",
          value: formatNumber(data.summary.weightAlerts),
          helper: "Tolérances hors plage",
        },
        {
          label: "Sécurité",
          value: formatNumber(data.summary.safetyFlags),
          helper: "Lots à revoir ou quarantaine",
        },
        {
          label: "Certifications",
          value: formatNumber(data.summary.pendingCertifications),
          helper: `${formatNumber(data.summary.revokedCertifications)} révoquées`,
        },
        {
          label: "Lots urgents",
          value: formatNumber(data.summary.urgentLotsAtRisk),
          helper: "Risque SLA ou qualité",
        },
      ]
    : undefined;

  async function handleAlertStatusChange(
    alertId: string,
    status: "acknowledged" | "resolved",
  ) {
    setSavingAlertId(alertId);
    setFeedback(null);

    const result = await updateA1AlertStatus(alertId, status);

    if (!result) {
      setFeedback("Impossible de mettre à jour le statut A1 depuis l'API.");
      setSavingAlertId(null);
      return;
    }

    setFeedback(`Alerte ${result.id} passée en ${formatEnumLabel(result.status)}.`);
    setSavingAlertId(null);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Contrôle & validation"
      description="Pilotage des alertes A1, écarts de poids, sécurité D2 et statut certification sur la colonne de contrôle NFN."
      requiredPermissions={["validation.view"]}
      loading={loading}
      updatedAt={updatedAt}
      error={canViewPage && !data ? error : null}
      onRefresh={refresh}
      metrics={metrics}
      showContent={Boolean(data)}
    >
      {feedback ? (
        <InfoListCard
          title="Dernière action"
          items={[
            {
              label: "Retour API",
              value: feedback,
              tone: feedback.startsWith("Impossible") ? "destructive" : "success",
            },
          ]}
        />
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <DataTableCard
              title="File A1"
              description="Alertes automatiques issues des seuils dépôt, saturation ou urgence."
              rows={data.a1Queue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucune alerte A1 active."
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
                {
                  header: "Action",
                  render: (row) => {
                    if (!canManageAlerts) {
                      return "Lecture seule";
                    }

                    return (
                      <div className="flex flex-wrap gap-2">
                        {row.status === "open" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={savingAlertId === row.id}
                            onClick={() =>
                              void handleAlertStatusChange(row.id, "acknowledged")
                            }
                          >
                            Accuser
                          </Button>
                        ) : null}
                        {row.status !== "resolved" ? (
                          <Button
                            size="sm"
                            disabled={savingAlertId === row.id}
                            onClick={() =>
                              void handleAlertStatusChange(row.id, "resolved")
                            }
                          >
                            Résoudre
                          </Button>
                        ) : (
                          "Clôturée"
                        )}
                      </div>
                    );
                  },
                },
              ]}
            />

            <InfoListCard
              title="Règles de contrôle"
              description="Lecture opérationnelle du CDC appliquée à la chaîne de custody."
              items={[
                {
                  label: "Escalade A1",
                  value: canManageAlerts ? "Active" : "Observateur",
                  helper: canManageAlerts
                    ? "Ce profil peut accuser et résoudre."
                    : "Ce profil ne modifie pas les statuts.",
                  tone: canManageAlerts ? "success" : "warning",
                },
                {
                  label: "Contrôles poids",
                  value: formatNumber(data.weightAlerts.length),
                  helper: "Handoff D1, D2 et aval consolidés",
                },
                {
                  label: "Contrôles sécurité",
                  value: formatNumber(data.safetyFindings.length),
                  helper: "Pré-wash C2 et qualification laverie",
                },
                {
                  label: "Lots urgents à risque",
                  value: formatNumber(data.urgentLotsAtRisk.length),
                  helper: "Surveillance SLA et vieillissement",
                  tone:
                    data.urgentLotsAtRisk.length > 0 ? "destructive" : "success",
                },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DataTableCard
              title="Écarts de poids"
              description="Événements de réconciliation hors tolérance entre deux points de passage."
              rows={data.weightAlerts}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun écart de poids critique."
              columns={[
                {
                  header: "Phase",
                  render: (row) => formatEnumLabel(row.phase),
                },
                {
                  header: "Référence",
                  render: (row) => row.reference ?? "—",
                },
                {
                  header: "Source",
                  render: (row) => formatEnumLabel(row.sourceType),
                },
                {
                  header: "Écart",
                  render: (row) => formatWeight(row.deltaKg),
                },
                {
                  header: "Signal",
                  render: (row) => (
                    <StatusBadge
                      value={row.toleranceExceeded ? "critical" : "info"}
                    />
                  ),
                },
                {
                  header: "Horodatage",
                  render: (row) => formatDateTime(row.occurredAt),
                },
              ]}
            />

            <DataTableCard
              title="Findings sécurité"
              description="Lots D2 ayant un flag sécurité, contamination ou note analyste."
              rows={data.safetyFindings}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun finding sécurité actif."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.lotQrCode ?? "—",
                },
                {
                  header: "Grade",
                  render: (row) => row.grade,
                },
                {
                  header: "Statut sécurité",
                  render: (row) => <StatusBadge value={row.safetyStatus} />,
                },
                {
                  header: "Analyste",
                  render: (row) => row.analystName ?? "—",
                },
                {
                  header: "Notes",
                  render: (row) => row.contaminationNotes ?? "—",
                },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <DataTableCard
              title="Queue certification"
              description="Produits en attente d'émission, révoqués ou nécessitant une revue."
              rows={data.certificationQueue}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun certificat à contrôler."
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
                  header: "Émis / créé",
                  render: (row) =>
                    formatDateTime(row.issuedAt ?? row.createdAt),
                },
                {
                  header: "Révocation",
                  render: (row) => row.revokedReason ?? "—",
                },
              ]}
            />

            <DataTableCard
              title="Urgents à risque"
              description="Lots C2 ou urgents dont l'âge ou la position crée un risque."
              rows={data.urgentLotsAtRisk}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun lot urgent en situation de risque."
              columns={[
                {
                  header: "Lot",
                  render: (row) => row.qrCode,
                },
                {
                  header: "Localisation",
                  render: (row) => formatEnumLabel(row.currentLocationType),
                },
                {
                  header: "Âge",
                  render: (row) =>
                    row.ageHours === null ? "—" : `${formatNumber(row.ageHours)} h`,
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
        </>
      ) : null}
    </OperationsPageShell>
  );
}
