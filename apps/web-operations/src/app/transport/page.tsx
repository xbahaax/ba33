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
import { TransportWorkflowPage } from "@/components/transport-workflow-page";
import { UnavailableState } from "@/components/unavailable-state";
import { getTransportOverview } from "@/lib/api";
import { formatDateTime, formatEnumLabel } from "@/lib/format";

export default function TransportPage() {
  return <TransportWorkflowPage />;
}

void LegacyTransportPage;

async function LegacyTransportPage() {
  const data = await getTransportOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Transport"
          description="Affectation, suivi et exécution des jobs de transport."
        />
        <UnavailableState message="Le module transport attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Transport"
        description="File des missions, urgences et suivi des lots en transit."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Jobs totaux" value={data.summary.totalJobs.toString()} />
        <MetricCard label="En attente" value={data.summary.pendingJobs.toString()} />
        <MetricCard label="En cours" value={data.summary.activeJobs.toString()} />
        <MetricCard label="Livrés" value={data.summary.deliveredJobs.toString()} />
        <MetricCard label="Urgents" value={data.summary.urgentJobs.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs récents</CardTitle>
          <CardDescription>
            Dernières affectations et avancement des transports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Transporteur
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Lane
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Origine
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Destination
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Lots
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    SLA
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
              {data.jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    {job.transporterName ?? "Non affecté"}
                  </td>
                  <td className="p-4 align-middle">{formatEnumLabel(job.lane)}</td>
                  <td className="p-4 align-middle">
                    {formatEnumLabel(job.originType)}
                  </td>
                  <td className="p-4 align-middle">
                    {formatEnumLabel(job.destinationType)}
                  </td>
                  <td className="p-4 align-middle">{job.lotCount}</td>
                  <td className="p-4 align-middle">
                    <StatusBadge value={job.status} />
                  </td>
                  <td className="p-4 align-middle">{formatDateTime(job.slaDeadline)}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
