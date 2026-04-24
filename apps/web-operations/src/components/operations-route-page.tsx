"use client";

import { useMemo, useTransition } from "react";
import { Button } from "@ba33/ui-web";
import { RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { UnavailableState } from "@/components/unavailable-state";
import { useAsyncData } from "@/hooks/use-async-data";
import { formatDateTime } from "@/lib/format";
import { getClientApiBaseUrl } from "@/lib/api";
import {
  getOperationsRoute,
  type OperationsRouteKey,
} from "@/lib/operations-routes";

interface OperationsRoutePageProps {
  routeKey: OperationsRouteKey;
}

export function OperationsRoutePage({
  routeKey,
}: OperationsRoutePageProps) {
  const route = getOperationsRoute(routeKey);
  const { data, error, loading, refresh, updatedAt } = useAsyncData(
    route.loader,
    [routeKey],
  );
  const [isPending, startTransition] = useTransition();

  const headerMeta = useMemo(() => {
    if (loading && !data) {
      return {
        icon: <Wifi className="h-4 w-4 text-warning-dark" />,
        label: "Connexion en cours",
        detail: getClientApiBaseUrl(),
      };
    }

    if (data) {
      return {
        icon: <Wifi className="h-4 w-4 text-success" />,
        label: "API connectee",
        detail: updatedAt
          ? `Derniere mise a jour ${formatDateTime(new Date(updatedAt).toISOString())}`
          : getClientApiBaseUrl(),
      };
    }

    return {
      icon: <WifiOff className="h-4 w-4 text-destructive" />,
      label: "API indisponible",
      detail: getClientApiBaseUrl(),
    };
  }, [data, loading, updatedAt]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(160,174,192,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,250,0.96))]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageHeader title={route.title} description={route.description} />

          <div className="flex flex-wrap items-center gap-3 self-start rounded-full border border-border/80 bg-card/80 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="flex items-center gap-2">
              {headerMeta.icon}
              {headerMeta.label}
            </span>
            <span className="hidden sm:inline">{headerMeta.detail}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startTransition(refresh)}
              disabled={loading || isPending}
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading || isPending ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </div>
        </div>

        {loading && !data ? (
          <LoadingState />
        ) : null}

        {!loading && !data ? (
          <UnavailableState
            message={error ?? `${route.emptyMessage} Source: ${getClientApiBaseUrl()}`}
          />
        ) : null}

        {data ? (
          <>
            {route.getMetrics ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
                {route.getMetrics(data).map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    helper={metric.helper}
                  />
                ))}
              </div>
            ) : null}

            <div className="space-y-4">{route.renderSections(data)}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
