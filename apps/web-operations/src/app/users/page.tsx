import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-border transition-colors hover:bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Nom
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Région
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                      Dernière connexion
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                {data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">{user.fullName}</td>
                    <td className="p-4 align-middle">{user.email}</td>
                    <td className="p-4 align-middle">
                      {formatEnumLabel(user.userType)}
                    </td>
                    <td className="p-4 align-middle">{user.regionName ?? "—"}</td>
                    <td className="p-4 align-middle">
                      <StatusBadge value={user.status} />
                    </td>
                    <td className="p-4 align-middle">{formatDateTime(user.lastLoginAt)}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
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
