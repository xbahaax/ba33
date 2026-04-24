import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ba33/ui-web";
import { MetricCard } from "@/components/metric-card";
import { OperationsRoutePage } from "@/components/operations-route-page";
import { PageHeader } from "@/components/page-header";
import { UnavailableState } from "@/components/unavailable-state";
import { getRulesOverview } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export default function SettingsPage() {
  return <OperationsRoutePage routeKey="settings" />;
}

void LegacySettingsPage;

async function LegacySettingsPage() {
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
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Clé
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Version
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Début
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Fin
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Créé par
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
              {data.rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-mono text-xs">{rule.ruleKey}</td>
                  <td className="p-4 align-middle">{rule.description ?? "—"}</td>
                  <td className="p-4 align-middle">{rule.version ?? "—"}</td>
                  <td className="p-4 align-middle">{formatDateTime(rule.effectiveFrom)}</td>
                  <td className="p-4 align-middle">{formatDateTime(rule.effectiveTo)}</td>
                  <td className="p-4 align-middle">{rule.createdByName ?? "—"}</td>
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
