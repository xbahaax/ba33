import { getLaverieOverview } from "@/lib/api";
import { formatDateTime, formatNumber, formatWeight } from "@/lib/format";
import { LaverieWorkflowPage } from "@/components/laverie-workflow-page";

export default function LaveriePage() {
  return <LaverieWorkflowPage />;
}

void LegacyLaveriePage;

async function LegacyLaveriePage() {
  const data = await getLaverieOverview();

  if (!data) {
    return (
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">Laverie</h1>
          <p className="text-muted-foreground">
            Ligne de lavage, contrôles et qualification.
          </p>
        </div>

        <div className="rounded-lg border p-6 text-muted-foreground">
          Le module laverie attend l’API backend.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Laverie</h1>
        <p className="text-muted-foreground">
          Suivi des installations, cycles actifs et qualifications récentes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Laveries" value={data.summary.totalLaveries} />
        <Metric label="Laveries actives" value={data.summary.activeLaveries} />
        <Metric label="Cycles actifs" value={data.summary.activeRuns} />
        <Metric label="Cycles totaux" value={data.summary.totalWashRuns} />
        <Metric label="Lots qualifiés" value={data.summary.gradedLots} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border bg-background p-6">
          <h2 className="text-xl font-semibold">Cycles actifs</h2>
          <p className="text-sm text-muted-foreground">
            Lavages en cours sur les installations.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Laverie</th>
                  <th className="px-4 py-3 text-left font-medium">Poids entrant</th>
                  <th className="px-4 py-3 text-left font-medium">Eau</th>
                  <th className="px-4 py-3 text-left font-medium">Température</th>
                  <th className="px-4 py-3 text-left font-medium">Démarré</th>
                </tr>
              </thead>

              <tbody>
                {data.activeRuns.map((run) => (
                  <tr key={run.id} className="border-b">
                    <td className="px-4 py-3">{run.laverieName ?? "—"}</td>
                    <td className="px-4 py-3">{formatWeight(run.dirtyWeightKg)}</td>
                    <td className="px-4 py-3">
                      {run.waterLiters
                        ? `${formatNumber(run.waterLiters)} L`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {run.waterTempC ? `${run.waterTempC}°C` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateTime(run.startedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-6">
          <h2 className="text-xl font-semibold">Qualifications récentes</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Grade</th>
                  <th className="px-4 py-3 text-left font-medium">Sécurité</th>
                  <th className="px-4 py-3 text-left font-medium">Longueur fibre</th>
                  <th className="px-4 py-3 text-left font-medium">Diamètre</th>
                  <th className="px-4 py-3 text-left font-medium">Daté</th>
                </tr>
              </thead>

              <tbody>
                {data.recentQualifications.map((qualification) => (
                  <tr key={qualification.id} className="border-b">
                    <td className="px-4 py-3 font-medium">
                      {qualification.grade}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-1 text-xs">
                        {qualification.safetyStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {qualification.fiberLengthMm
                        ? `${qualification.fiberLengthMm} mm`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {qualification.fiberDiameterMicron
                        ? `${qualification.fiberDiameterMicron} µm`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateTime(qualification.performedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
