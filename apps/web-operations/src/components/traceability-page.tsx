"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import { DataTableCard } from "@/components/data-table-card";
import { InfoListCard } from "@/components/info-list-card";
import {
  type OperationsMetric,
  OperationsPageShell,
} from "@/components/operations-page-shell";
import { StatusBadge } from "@/components/status-badge";
import { useSession } from "@/components/session-provider";
import { lookupTraceability, type TraceabilityLookupResponse } from "@/lib/api";
import {
  formatCurrency,
  formatDateTime,
  formatEnumLabel,
  formatNumber,
  formatWeight,
} from "@/lib/format";

export function TraceabilityPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("traceability.view");
  const [lookupKey, setLookupKey] = useState("");
  const [activeLookupKey, setActiveLookupKey] = useState<string | null>(null);
  const [data, setData] = useState<TraceabilityLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Poids référentiel",
          value: formatWeight(data.header.weightKg),
        },
        {
          label: "Handoffs",
          value: formatNumber(data.chainOfCustody.length),
          helper: "Chaîne de custody reconstituée",
        },
        {
          label: "Contrôles qualité",
          value: formatNumber(data.qualityChecks.length),
          helper: "Qualification et pricing",
        },
        {
          label: "Sorties aval",
          value: formatNumber(data.downstreamLinks.length),
          helper: "Produits ou liens downstream",
        },
      ]
    : undefined;

  async function runLookup(explicitLookupKey?: string) {
    const candidate = (explicitLookupKey ?? lookupKey).trim();

    if (!candidate) {
      setError("Saisissez un Lot ID, QR, code P1/P2 ou référence certificat.");
      setData(null);
      setActiveLookupKey(null);
      return;
    }

    if (!session || !canViewPage) {
      return;
    }

    setLoading(true);
    setError(null);

    const result = await lookupTraceability(candidate);

    if (!result) {
      setData(null);
      setActiveLookupKey(candidate);
      setError("Aucune traçabilité exploitable n'a été retournée pour cette référence.");
      setLoading(false);
      return;
    }

    setData(result);
    setActiveLookupKey(candidate);
    setUpdatedAt(Date.now());
    setLoading(false);
  }

  const lookupSummary = useMemo(
    () =>
      data
        ? [
            {
              label: "Référence",
              value: activeLookupKey ?? data.header.title,
              helper: data.header.subtitle ?? "Référence demandée",
            },
            {
              label: "Statut",
              value: <StatusBadge value={data.header.status} />,
            },
            {
              label: "Source",
              value:
                data.header.sourceType || data.header.track
                  ? formatEnumLabel(data.header.sourceType ?? data.header.track)
                  : "—",
            },
            {
              label: "Région",
              value: data.header.regionName ?? "—",
            },
          ]
        : [],
    [activeLookupKey, data],
  );

  return (
    <OperationsPageShell
      title="Traçabilité"
      description="Lookup instantané de la colonne vertébrale NFN: lot, produit ou certificat, avec reconstitution de lineage et handoffs."
      requiredPermissions={["traceability.view"]}
      loading={loading}
      updatedAt={updatedAt}
      onRefresh={() => runLookup(activeLookupKey ?? undefined)}
      metrics={metrics}
      showContent
    >
      <Card>
        <CardHeader>
          <CardTitle>Recherche opérateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 lg:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void runLookup();
            }}
          >
            <Input
              value={lookupKey}
              onChange={(event) => setLookupKey(event.target.value)}
              placeholder="LOT-..., QR..., P1..., P2..., certificat..."
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              Rechercher
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <InfoListCard title="Résultat lookup" items={[{ label: "Statut", value: error, tone: "destructive" }]} /> : null}

      {!data && !error ? (
        <InfoListCard
          title="Références acceptées"
          description="Le moteur recherche dans les lots, produits et certificats disponibles."
          items={[
            {
              label: "Lots",
              value: "Lot ID ou QR",
              helper: "Ex. ID UUID ou code physique imprimé sur le sac",
            },
            {
              label: "Produits",
              value: "Code P1 / P2",
              helper: "Sortie D3 ou D4 certifiable",
            },
            {
              label: "Certificats",
              value: "Référence produit/certificat",
              helper: "Vérification amont pour audit, vente ou litige",
            },
          ]}
        />
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <InfoListCard
              title={data.header.title}
              description="En-tête de la référence résolue."
              items={lookupSummary}
            />
            <InfoListCard
              title="Résumé source"
              description="Données consolidées depuis la spine événementielle."
              items={data.sourceSummary.map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <DataTableCard
              title="Chaîne de custody"
              description="Séquence des mouvements et validations du point d'entrée jusqu'à l'aval."
              rows={data.chainOfCustody}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun handoff n'a été restitué."
              columns={[
                {
                  header: "Étape",
                  render: (row) => row.label,
                },
                {
                  header: "Phase",
                  render: (row) => formatEnumLabel(row.stage),
                },
                {
                  header: "Poids",
                  render: (row) => formatWeight(row.weightKg),
                },
                {
                  header: "Statut",
                  render: (row) => <StatusBadge value={row.status} />,
                },
                {
                  header: "Horodatage",
                  render: (row) => formatDateTime(row.occurredAt),
                },
              ]}
            />

            <DataTableCard
              title="Pesées"
              description="Points de pesée utilisés pour la réconciliation."
              rows={data.weighs}
              getRowKey={(row) => row.id}
              emptyMessage="Aucune pesée enregistrée."
              columns={[
                {
                  header: "Phase",
                  render: (row) => formatEnumLabel(row.phase),
                },
                {
                  header: "Poids",
                  render: (row) => formatWeight(row.weightKg),
                },
                {
                  header: "Source",
                  render: (row) => row.source ?? "—",
                },
                {
                  header: "Enregistrée",
                  render: (row) => formatDateTime(row.recordedAt),
                },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DataTableCard
              title="Contrôles qualité"
              description="Qualification, sécurité et pricing liés à la référence."
              rows={data.qualityChecks}
              getRowKey={(row) => row.id}
              emptyMessage="Aucun contrôle qualité lié."
              columns={[
                {
                  header: "Grade",
                  render: (row) => row.grade ?? "—",
                },
                {
                  header: "Sécurité",
                  render: (row) => <StatusBadge value={row.safetyStatus} />,
                },
                {
                  header: "Fibre",
                  render: (row) =>
                    row.fiberLengthMm && row.fiberDiameterMicron
                      ? `${row.fiberLengthMm} mm / ${row.fiberDiameterMicron} µ`
                      : "—",
                },
                {
                  header: "Valeur",
                  render: (row) =>
                    row.totalValue
                      ? formatCurrency(row.totalValue, "DZD")
                      : row.pricePerKg
                        ? formatCurrency(row.pricePerKg, "DZD")
                        : "—",
                },
                {
                  header: "Date",
                  render: (row) => formatDateTime(row.performedAt),
                },
              ]}
            />

            <DataTableCard
              title="Liens aval"
              description="Produits transformés et certification associés à la référence."
              rows={data.downstreamLinks}
              getRowKey={(row) => row.id}
              emptyMessage="Aucune sortie aval liée."
              columns={[
                {
                  header: "Produit",
                  render: (row) => row.productCode ?? "—",
                },
                {
                  header: "Track",
                  render: (row) => formatEnumLabel(row.track),
                },
                {
                  header: "Transformer",
                  render: (row) => row.transformerName ?? "—",
                },
                {
                  header: "Produit",
                  render: (row) => <StatusBadge value={row.productStatus} />,
                },
                {
                  header: "Certification",
                  render: (row) => <StatusBadge value={row.certificationStatus} />,
                },
              ]}
            />
          </div>

          <DataTableCard
            title="Timeline append-only"
            description="Derniers événements attachés à cette référence."
            rows={data.timeline}
            getRowKey={(row) => row.id}
            emptyMessage="Aucun événement complémentaire."
            columns={[
              {
                header: "Événement",
                render: (row) => formatEnumLabel(row.eventType),
              },
              {
                header: "Agrégat",
                render: (row) => formatEnumLabel(row.aggregateType),
              },
              {
                header: "Acteur",
                render: (row) =>
                  row.actorName ?? formatEnumLabel(row.actorType),
              },
              {
                header: "Horodatage",
                render: (row) => formatDateTime(row.occurredAt),
              },
            ]}
          />
        </>
      ) : null}
    </OperationsPageShell>
  );
}
