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
import { ActionFeedback } from "@/components/workflow-form-controls";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  advanceTransportJob,
  getTransportOverview,
  type TransportOverviewResponse,
} from "@/lib/api";
import {
  formatDateTime,
  formatEnumLabel,
  formatNumber,
} from "@/lib/format";

export function TransportWorkflowPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("transport.view");
  const canManage = hasPermission("transport.manage");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"default" | "destructive" | "success">(
    "default",
  );
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const { data, error, loading, refresh, updatedAt } = useAsyncData<TransportOverviewResponse>(
    () => {
      if (!session || !canViewPage) {
        return Promise.resolve(null);
      }

      return getTransportOverview();
    },
    [session?.user.id, canViewPage],
  );

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Jobs totaux",
          value: formatNumber(data.summary.totalJobs),
          helper: `${formatNumber(data.summary.urgentJobs)} urgents`,
        },
        {
          label: "En attente",
          value: formatNumber(data.summary.pendingJobs),
          helper: "Affectation ou acceptation à faire",
        },
        {
          label: "En cours",
          value: formatNumber(data.summary.activeJobs),
          helper: "Chaîne de custody active",
        },
        {
          label: "Livrés",
          value: formatNumber(data.summary.deliveredJobs),
          helper: `${formatNumber(data.summary.cancelledJobs)} annulés`,
        },
      ]
    : undefined;

  async function handleAction(
    jobId: string,
    action: "accept" | "start" | "deliver",
  ) {
    setActiveJobId(jobId);
    setFeedback(null);

    const result = await advanceTransportJob(jobId, action);

    if (!result) {
      setFeedback("Impossible de mettre à jour le job transport.");
      setFeedbackTone("destructive");
      setActiveJobId(null);
      return;
    }

    setFeedback(`Job ${result.id} passé en ${formatEnumLabel(result.status)}.`);
    setFeedbackTone("success");
    setActiveJobId(null);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Transport"
      description="Acceptation, démarrage et clôture des legs transport entre source, dépôt, laverie et aval."
      requiredPermissions={["transport.view"]}
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
          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <DataTableCard
              title="Queue transport"
              description="Actions dédiées au transporteur / dispatch sur chaque leg."
              rows={data.jobs}
              getRowKey={(row) => row.id}
              columns={[
                {
                  header: "Lane",
                  render: (row) => <StatusBadge value={row.lane} />,
                },
                {
                  header: "Itinéraire",
                  render: (row) =>
                    `${formatEnumLabel(row.originType)} → ${formatEnumLabel(row.destinationType)}`,
                },
                {
                  header: "Statut",
                  render: (row) => <StatusBadge value={row.status} />,
                },
                {
                  header: "Lots",
                  render: (row) => formatNumber(row.lotCount),
                },
                {
                  header: "SLA",
                  render: (row) => formatDateTime(row.slaDeadline),
                },
                {
                  header: "Action",
                  render: (row) => {
                    if (!canManage) {
                      return "Lecture seule";
                    }

                    return (
                      <div className="flex flex-wrap gap-2">
                        {(row.status === "pending" || row.status === "assigned") && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={activeJobId === row.id}
                            onClick={() => void handleAction(row.id, "accept")}
                          >
                            Accepter
                          </Button>
                        )}
                        {(row.status === "pending" ||
                          row.status === "assigned" ||
                          row.status === "accepted") && (
                          <Button
                            size="sm"
                            disabled={activeJobId === row.id}
                            onClick={() => void handleAction(row.id, "start")}
                          >
                            Démarrer
                          </Button>
                        )}
                        {(row.status === "accepted" || row.status === "in_progress") && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={activeJobId === row.id}
                            onClick={() => void handleAction(row.id, "deliver")}
                          >
                            Livrer
                          </Button>
                        )}
                        {["delivered", "cancelled"].includes(row.status) && "Clôturé"}
                      </div>
                    );
                  },
                },
              ]}
            />

            <InfoListCard
              title="Capacités transport"
              items={[
                {
                  label: "Pilotage opérationnel",
                  value: canManage ? "Actif" : "Lecture seule",
                  tone: canManage ? "success" : "warning",
                },
                {
                  label: "Jobs urgents",
                  value: formatNumber(data.summary.urgentJobs),
                  helper: "Cold-chain ou standard urgent",
                  tone:
                    data.summary.urgentJobs > 0 ? "warning" : "default",
                },
                {
                  label: "Jobs livrés",
                  value: formatNumber(data.summary.deliveredJobs),
                },
                {
                  label: "Annulations",
                  value: formatNumber(data.summary.cancelledJobs),
                },
              ]}
            />
          </div>

          <DataTableCard
            title="Vue détaillée des legs"
            rows={data.jobs}
            getRowKey={(row) => `${row.id}-detail`}
            columns={[
              {
                header: "Job",
                render: (row) => row.id,
              },
              {
                header: "Transporteur",
                render: (row) => row.transporterName ?? "—",
              },
              {
                header: "Demandé",
                render: (row) => formatDateTime(row.requestedAt),
              },
              {
                header: "Accepté",
                render: (row) => formatDateTime(row.acceptedAt),
              },
              {
                header: "Terminé",
                render: (row) => formatDateTime(row.completedAt),
              },
            ]}
          />
        </>
      ) : null}
    </OperationsPageShell>
  );
}
