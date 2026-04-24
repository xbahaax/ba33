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
import { UnavailableState } from "@/components/unavailable-state";
import { getRulesOverview } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default async function SettingsPage() {
  const data = await getRulesOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="Paramètres"
          description="Configuration métier et règles de la plateforme."
        />
        <UnavailableState message="Le module paramètres attend l’API backend." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Paramètres"
        description="Lecture des règles configurées pour les seuils, dispatch et traitements métier."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Règles total" value={data.summary.totalRules.toString()} />
        <MetricCard label="Règles actives" value={data.summary.activeRules.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Règles configurées</CardTitle>
          <CardDescription>
            Dernières versions connues du moteur de règles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clé</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Créé par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-xs">{rule.ruleKey}</TableCell>
                  <TableCell>{rule.description ?? "—"}</TableCell>
                  <TableCell>{rule.version ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(rule.effectiveFrom)}</TableCell>
                  <TableCell>{formatDateTime(rule.effectiveTo)}</TableCell>
                  <TableCell>{rule.createdByName ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
