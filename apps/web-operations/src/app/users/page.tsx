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
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { UnavailableState } from "@/components/unavailable-state";
import { getUsersOverview } from "@/lib/api";
import { formatDateTime, formatEnumLabel } from "@/lib/format";

export default async function UsersPage() {
  const data = await getUsersOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Utilisateurs"
          description="Administration des comptes et rôles métier."
        />
        <UnavailableState message="Le module utilisateurs attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Utilisateurs"
        description="Lecture du parc d’utilisateurs et de leur activité récente."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total" value={data.summary.totalUsers.toString()} />
        <MetricCard label="Actifs" value={data.summary.activeUsers.toString()} />
        <MetricCard
          label="Suspendus"
          value={data.summary.suspendedUsers.toString()}
        />
        <MetricCard label="Supprimés" value={data.summary.deletedUsers.toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs récents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatEnumLabel(user.userType)}</TableCell>
                    <TableCell>{user.regionName ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge value={user.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(user.lastLoginAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Comptes classés par rôle métier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.summary.typeBreakdown.map((row) => (
              <div
                key={row.userType}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span>{formatEnumLabel(row.userType)}</span>
                <span className="font-mono text-sm">{row.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
