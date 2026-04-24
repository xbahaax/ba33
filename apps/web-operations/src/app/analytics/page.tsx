import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.summary.statusBreakdown.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{formatEnumLabel(row.status)}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown statuts transport</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transport.summary.statusBreakdown.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{formatEnumLabel(row.status)}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown statuts ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.summary.statusBreakdown.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{formatEnumLabel(row.status)}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown utilisateurs</CardTitle>
            <CardDescription>Répartition par type d’acteur.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.summary.typeBreakdown.map((row) => (
                  <TableRow key={row.userType}>
                    <TableCell>{formatEnumLabel(row.userType)}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
