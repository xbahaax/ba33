'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ba33/ui-web';
import {
  Package,
  Scale,
  Users,
  Truck,
  Building2,
  MapPin,
  Activity,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api/v1';

const STATUS_LABELS: Record<string, string> = {
  announced: 'Annoncé',
  collected: 'Collecté',
  in_transit: 'En transit',
  received_depot: 'Reçu dépôt',
  in_pretri: 'Pré-tri',
  stored: 'Stocké',
  washing: 'Lavage',
  washed: 'Lavé',
  qualified: 'Qualifié',
  certified: 'Certifié',
  sold: 'Vendu',
  rejected: 'Rejeté',
  quarantined: 'Quarantaine',
  pending: 'En attente',
  assigned: 'Assigné',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const SOURCE_LABELS: Record<string, string> = {
  c1_shepherd: 'Bergers (C1)',
  c2_slaughterhouse: 'Abattoirs (C2)',
  c3_aggregator: 'Agrégateurs (C3)',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  announced: 'outline',
  collected: 'default',
  in_transit: 'secondary',
  received_depot: 'default',
  pending: 'outline',
  assigned: 'secondary',
  completed: 'default',
  rejected: 'destructive',
  quarantined: 'destructive',
  cancelled: 'destructive',
};

interface DashboardData {
  users: { total: number; byType: Record<string, number> };
  sources: { total: number; byType: Record<string, number> };
  lots: {
    total: number;
    byStatus: Record<string, number>;
    totalDeclaredKg: string;
    totalActualKg: string;
  };
  preLots: { total: number; byStatus: Record<string, number> };
  transport: { total: number; byStatus: Record<string, number> };
  depot: { totalDepots: number; totalCapacityKg: string; totalCurrentKg: string };
  regions: { total: number };
  recentLots: Array<{
    id: string;
    qrCode: string;
    status: string;
    sourceType: string;
    declaredWeightKg: string;
    actualWeightKg: string | null;
    isUrgent: boolean;
    createdAt: string;
  }>;
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-20 rounded-lg bg-muted" />
          <div className="h-8 w-24 rounded-lg bg-muted" />
          <div className="h-3 w-32 rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonTable() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse h-5 w-40 rounded-lg bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 flex-1 rounded-lg bg-muted" />
              <div className="h-4 w-20 rounded-lg bg-muted" />
              <div className="h-4 w-16 rounded-lg bg-muted" />
              <div className="h-4 w-24 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('ba33_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/institutional/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.status === 401) {
        localStorage.removeItem('ba33_token');
        localStorage.removeItem('ba33_refresh');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const depotUsagePercent =
    data && parseFloat(data.depot.totalCapacityKg) > 0
      ? ((parseFloat(data.depot.totalCurrentKg) / parseFloat(data.depot.totalCapacityKg)) * 100).toFixed(1)
      : '0';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d&apos;ensemble de la filière laine nationale
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchDashboard}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !data ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : data ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total lots
                  </span>
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                  {data.lots.total}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {Object.keys(data.lots.byStatus).length} statuts différents
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Poids total
                  </span>
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                  {parseFloat(data.lots.totalActualKg).toLocaleString('fr-FR')}
                  <span className="text-lg text-muted-foreground ml-1">kg</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {parseFloat(data.lots.totalDeclaredKg).toLocaleString('fr-FR')} kg déclarés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Sources actives
                  </span>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                  {data.sources.total}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  dans {data.regions.total} régions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Pré-lots en attente
                  </span>
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                  {data.preLots.byStatus['announced'] || 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.preLots.total} pré-lots au total
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Middle Row: Status + Sources + Transport + Depot */}
      {loading && !data ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <SkeletonTable />
          <SkeletonTable />
        </div>
      ) : data ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Lots by Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Lots par statut</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.lots.byStatus).map(([status, count]) => {
                  const percent = data.lots.total > 0 ? (count / data.lots.total) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge variant={STATUS_VARIANT[status] || 'outline'} className="w-28 justify-center text-xs">
                        {STATUS_LABELS[status] || status}
                      </Badge>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm text-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sources by Type */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Sources par type</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.sources.byType).map(([type, count]) => {
                  const percent = data.sources.total > 0 ? (count / data.sources.total) * 100 : 0;
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">
                          {SOURCE_LABELS[type] || type}
                        </span>
                        <span className="font-mono text-sm font-medium text-foreground">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-border space-y-3">
                  {/* Transport Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      Transports
                    </div>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {data.transport.total}
                    </span>
                  </div>

                  {/* Depot Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Dépôts
                    </div>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {data.depot.totalDepots}
                    </span>
                  </div>

                  {/* Depot Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Capacité dépôts</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {parseFloat(data.depot.totalCurrentKg).toLocaleString('fr-FR')} / {parseFloat(data.depot.totalCapacityKg).toLocaleString('fr-FR')} kg ({depotUsagePercent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/50 transition-all duration-500"
                        style={{ width: `${Math.min(parseFloat(depotUsagePercent), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Recent Activity Table */}
      {loading && !data ? (
        <SkeletonTable />
      ) : data && data.recentLots && data.recentLots.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Activité récente</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">
                {data.recentLots.length} derniers lots
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Source
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Poids (kg)
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Urgent
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLots.map((lot, i) => (
                    <tr
                      key={lot.id}
                      className={`border-b border-border/50 transition-colors hover:bg-accent/50 ${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                      }`}
                    >
                      <td className="py-3 px-2">
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded-md">
                          {(lot.qrCode || lot.id || '—').substring(0, 16)}
                        </code>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={STATUS_VARIANT[lot.status] || 'outline'} className="text-xs">
                          {STATUS_LABELS[lot.status] || lot.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-foreground">
                        {SOURCE_LABELS[lot.sourceType] || lot.sourceType}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-foreground">
                          {parseFloat(lot.declaredWeightKg).toLocaleString('fr-FR')}
                        </span>
                        {lot.actualWeightKg && (
                          <span className="text-muted-foreground text-xs ml-1">
                            ({parseFloat(lot.actualWeightKg).toLocaleString('fr-FR')})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {lot.isUrgent ? (
                          <AlertTriangle className="h-4 w-4 text-destructive inline-block" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground text-xs">
                        {formatDate(lot.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
