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
import { advanceOrder, getSalesOverview, type SalesOverviewResponse } from "@/lib/api";
import {
  formatCurrency,
  formatDateTime,
  formatEnumLabel,
  formatNumber,
} from "@/lib/format";

const defaultActionByStatus: Record<string, "confirm" | "mark_paid" | "ship" | "deliver"> =
  {
    draft: "confirm",
    quote: "confirm",
    confirmed: "mark_paid",
    paid: "ship",
    preparing: "ship",
    shipped: "deliver",
  };

export function SalesWorkflowPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("sales.view");
  const canManage = hasPermission("sales.manage");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"default" | "destructive" | "success">(
    "default",
  );
  const [submitting, setSubmitting] = useState(false);
  const { data, error, loading, refresh, updatedAt } = useAsyncData<SalesOverviewResponse>(
    () => {
      if (!session || !canViewPage) {
        return Promise.resolve(null);
      }

      return getSalesOverview();
    },
    [session?.user.id, canViewPage],
  );

  const [orderId, setOrderId] = useState("");
  const [action, setAction] = useState<"confirm" | "mark_paid" | "ship" | "deliver">(
    "confirm",
  );
  const [trackingReference, setTrackingReference] = useState("");

  useEffect(() => {
    if (!data || orderId) {
      return;
    }

    const firstOrder = data.orders[0];
    if (!firstOrder) {
      return;
    }

    setOrderId(firstOrder.id);
    setAction(defaultActionByStatus[firstOrder.status] ?? "confirm");
    setTrackingReference(firstOrder.trackingReference ?? "");
  }, [data, orderId]);

  const selectedOrder = data?.orders.find((item) => item.id === orderId) ?? null;
  const availableActions = selectedOrder
    ? [
        selectedOrder.status === "draft" || selectedOrder.status === "quote"
          ? "confirm"
          : null,
        ["confirmed", "paid", "preparing", "shipped"].includes(selectedOrder.status)
          ? "mark_paid"
          : null,
        ["confirmed", "paid", "preparing"].includes(selectedOrder.status) ? "ship" : null,
        ["shipped", "preparing"].includes(selectedOrder.status) ? "deliver" : null,
      ].filter((value): value is typeof action => Boolean(value))
    : [];

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Commandes totales",
          value: formatNumber(data.summary.totalOrders),
        },
        {
          label: "Ouvertes",
          value: formatNumber(data.summary.openOrders),
          helper: "Quote, confirmées, payées ou en préparation",
        },
        {
          label: "Expédiées",
          value: formatNumber(data.summary.shippedOrders),
        },
        {
          label: "Livrées",
          value: formatNumber(data.summary.deliveredOrders),
          helper: `${formatNumber(data.summary.returnedOrders)} retours`,
        },
      ]
    : undefined;

  async function handleSubmit() {
    if (!orderId || !availableActions.includes(action)) {
      setFeedback("Choisis une commande et une action valide.");
      setFeedbackTone("destructive");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const result = await advanceOrder(orderId, {
      action,
      trackingReference:
        action === "ship" || action === "deliver" ? trackingReference || undefined : undefined,
    });

    if (!result) {
      setFeedback("Impossible de faire avancer la commande.");
      setFeedbackTone("destructive");
      setSubmitting(false);
      return;
    }

    setFeedback(`Commande ${result.id} passée en ${formatEnumLabel(result.status)}.`);
    setFeedbackTone("success");
    setSubmitting(false);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Gestion des ventes"
      description="Pilotage des commandes nationales, export et institutionnelles avec expédition et livraison."
      requiredPermissions={["sales.view"]}
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
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Action commerciale</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <WorkflowField label="Commande">
                  <WorkflowSelect
                    value={orderId}
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setOrderId(nextId);
                      const nextOrder = data.orders.find((item) => item.id === nextId);
                      setAction(defaultActionByStatus[nextOrder?.status ?? "quote"] ?? "confirm");
                      setTrackingReference(nextOrder?.trackingReference ?? "");
                    }}
                    disabled={!canManage}
                  >
                    <option value="">Sélectionner une commande</option>
                    {data.orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.id} · {order.buyerCompanyName ?? "Acheteur"} ·{" "}
                        {formatEnumLabel(order.status)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Action">
                  <WorkflowSelect
                    value={action}
                    onChange={(event) =>
                      setAction(
                        event.target.value as
                          | "confirm"
                          | "mark_paid"
                          | "ship"
                          | "deliver",
                      )
                    }
                    disabled={!canManage}
                  >
                    {availableActions.map((value) => (
                      <option key={value} value={value}>
                        {formatEnumLabel(value)}
                      </option>
                    ))}
                  </WorkflowSelect>
                </WorkflowField>
                <WorkflowField label="Référence tracking">
                  <Input
                    value={trackingReference}
                    onChange={(event) => setTrackingReference(event.target.value)}
                    disabled={!canManage}
                    placeholder="SHIP-BA33-..."
                  />
                </WorkflowField>
                <Button onClick={() => void handleSubmit()} disabled={!canManage || submitting}>
                  {submitting ? "Traitement..." : "Appliquer"}
                </Button>
              </CardContent>
            </Card>

            <InfoListCard
              title="Capacités ventes"
              items={[
                {
                  label: "Workflow commandes",
                  value: canManage ? "Actif" : "Lecture seule",
                  tone: canManage ? "success" : "warning",
                },
                {
                  label: "Commandes ouvertes",
                  value: formatNumber(data.summary.openOrders),
                },
                {
                  label: "Expédiées",
                  value: formatNumber(data.summary.shippedOrders),
                },
                {
                  label: "Livrées",
                  value: formatNumber(data.summary.deliveredOrders),
                },
              ]}
            />
          </div>

          <DataTableCard
            title="Commandes récentes"
            rows={data.orders}
            getRowKey={(row) => row.id}
            columns={[
              {
                header: "Commande",
                render: (row) => row.id,
              },
              {
                header: "Acheteur",
                render: (row) => row.buyerCompanyName ?? "—",
              },
              {
                header: "Canal",
                render: (row) => formatEnumLabel(row.channel),
              },
              {
                header: "Statut",
                render: (row) => <StatusBadge value={row.status} />,
              },
              {
                header: "Paiement",
                render: (row) => <StatusBadge value={row.paymentStatus} />,
              },
              {
                header: "Shipment",
                render: (row) =>
                  row.shipmentStatus ? <StatusBadge value={row.shipmentStatus} /> : "—",
              },
              {
                header: "Total",
                render: (row) => formatCurrency(row.total, row.currency),
              },
              {
                header: "Créée",
                render: (row) => formatDateTime(row.createdAt),
              },
            ]}
          />
        </>
      ) : null}
    </OperationsPageShell>
  );
}
