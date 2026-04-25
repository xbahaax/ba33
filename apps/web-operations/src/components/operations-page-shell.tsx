"use client";

import { type ReactNode, useMemo, useTransition } from "react";
import { Button } from "@ba33/ui-web";
import { RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/components/session-provider";
import { UnavailableState } from "@/components/unavailable-state";
import { formatDateTime } from "@/lib/format";
import { getClientApiBaseUrl } from "@/lib/api";

export interface OperationsMetric {
  label: string;
  value: string;
  helper?: string;
}

interface OperationsPageShellProps {
  children?: ReactNode;
  description: string;
  error?: string | null;
  loading: boolean;
  metrics?: OperationsMetric[];
  onRefresh: () => void | Promise<void>;
  requiredPermissions?: string[];
  showContent?: boolean;
  title: string;
  updatedAt?: number | null;
}

export function OperationsPageShell({
  children,
  description,
  error,
  loading,
  metrics,
  onRefresh,
  requiredPermissions = [],
  showContent = true,
  title,
  updatedAt,
}: OperationsPageShellProps) {
  const { hasPermission, loading: sessionLoading, session } = useSession();
  const [isPending, startTransition] = useTransition();
  const canViewPage =
    requiredPermissions.length === 0 || hasPermission(...requiredPermissions);

  const headerMeta = useMemo(() => {
    if (sessionLoading) {
      return {
        detail: "Initialisation du profil opérateur",
        icon: <Wifi className="h-4 w-4 text-amber-600" />,
        label: "Session en cours",
      };
    }

    if (!session) {
      return {
        detail: "Authentification requise",
        icon: <WifiOff className="h-4 w-4 text-destructive" />,
        label: "Session indisponible",
      };
    }

    if (loading) {
      return {
        detail: getClientApiBaseUrl(),
        icon: <Wifi className="h-4 w-4 text-amber-600" />,
        label: "Connexion en cours",
      };
    }

    if (updatedAt) {
      return {
        detail: `Dernière mise à jour ${formatDateTime(new Date(updatedAt).toISOString())}`,
        icon: <Wifi className="h-4 w-4 text-primary" />,
        label: "API connectée",
      };
    }

    if (error) {
      return {
        detail: getClientApiBaseUrl(),
        icon: <WifiOff className="h-4 w-4 text-destructive" />,
        label: "API indisponible",
      };
    }

    return {
      detail: getClientApiBaseUrl(),
      icon: <Wifi className="h-4 w-4 text-primary" />,
      label: "Console prête",
    };
  }, [error, loading, session, sessionLoading, updatedAt]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageHeader title={title} description={description} />

          <div className="flex flex-wrap items-center gap-3 self-start rounded-full border border-border/80 bg-card/80 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="flex items-center gap-2">
              {headerMeta.icon}
              {headerMeta.label}
            </span>
            <span className="hidden sm:inline">{headerMeta.detail}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                startTransition(() => {
                  void onRefresh();
                })
              }
              disabled={loading || isPending}
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading || isPending ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </div>
        </div>

        {(sessionLoading || (loading && session && canViewPage)) ? (
          <LoadingState />
        ) : null}

        {!sessionLoading && !session ? (
          <UnavailableState message="Aucune session active n'est disponible pour le centre d'opérations." />
        ) : null}

        {!sessionLoading && session && !canViewPage ? (
          <UnavailableState message="Ce profil n'a pas les permissions requises pour accéder à cet écran." />
        ) : null}

        {!sessionLoading && session && canViewPage && error && !showContent ? (
          <UnavailableState message={error} />
        ) : null}

        {!sessionLoading && session && canViewPage && metrics?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                helper={metric.helper}
              />
            ))}
          </div>
        ) : null}

        {!sessionLoading && session && canViewPage && showContent ? (
          <div className="space-y-4">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
