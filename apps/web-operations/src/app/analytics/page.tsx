import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ba33/ui-web";
import {
  getCertificationOverview,
  getLotsSummary,
  getSalesOverview,
  getTransportOverview,
  getUsersOverview,
} from "@/lib/api";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { UnavailableState } from "@/components/unavailable-state";
import { formatEnumLabel } from "@/lib/format";

export default async function AnalyticsPage() {
  const [lots, transport, sales, certification, users] = await Promise.all([
    getLotsSummary(),
    getTransportOverview(),
    getSalesOverview(),
    getCertificationOverview(),
    getUsersOverview(),
  ]);

  if (!lots || !transport || !sales || !certification || !users) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Statistiques"
          description="Lecture synthétique des flux et capacités."
        />
        <UnavailableState message="Les statistiques attendent les endpoints backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Statistiques"
        description="Breakdowns transverses pour les lots, transports, ventes, certification et utilisateurs."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Lots" value={lots.summary.totalLots.toString()} />
        <MetricCard label="Jobs transport" value={transport.summary.totalJobs.toString()} />
        <MetricCard label="Commandes" value={sales.summary.totalOrders.toString()} />
        <MetricCard
          label="Certifications"
          value={certification.summary.totalCertifications.toString()}
        />
        <MetricCard label="Utilisateurs" value={users.summary.totalUsers.toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown statuts lots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {lots.summary.statusBreakdown.map((row) => (
                  <tr
                    key={row.status}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{formatEnumLabel(row.status)}</td>
                    <td className="p-4 align-middle">{row.count}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown statuts transport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {transport.summary.statusBreakdown.map((row) => (
                  <tr
                    key={row.status}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{formatEnumLabel(row.status)}</td>
                    <td className="p-4 align-middle">{row.count}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown statuts ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {sales.summary.statusBreakdown.map((row) => (
                  <tr
                    key={row.status}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{formatEnumLabel(row.status)}</td>
                    <td className="p-4 align-middle">{row.count}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown utilisateurs</CardTitle>
            <CardDescription>Répartition par type d’acteur.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {users.summary.typeBreakdown.map((row) => (
                  <tr
                    key={row.userType}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      {formatEnumLabel(row.userType)}
                    </td>
                    <td className="p-4 align-middle">{row.count}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
