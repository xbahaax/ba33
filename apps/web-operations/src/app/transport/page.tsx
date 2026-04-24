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
import { getTransportOverview } from "@/lib/api";
import { formatDateTime, formatEnumLabel } from "@/lib/format";

export default async function TransportPage() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transporteur</TableHead>
                <TableHead>Lane</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Lots</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.transporterName ?? "Non affecté"}</TableCell>
                  <TableCell>{formatEnumLabel(job.lane)}</TableCell>
                  <TableCell>{formatEnumLabel(job.originType)}</TableCell>
                  <TableCell>{formatEnumLabel(job.destinationType)}</TableCell>
                  <TableCell>{job.lotCount}</TableCell>
                  <TableCell>
                    <StatusBadge value={job.status} />
                  </TableCell>
                  <TableCell>{formatDateTime(job.slaDeadline)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
