"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@ba33/ui-web";
import { DataTableCard } from "@/components/data-table-card";
import { InfoListCard } from "@/components/info-list-card";
import {
  type OperationsMetric,
  OperationsPageShell,
} from "@/components/operations-page-shell";
import { StatusBadge } from "@/components/status-badge";
import { useSession } from "@/components/session-provider";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  getRulesOverview,
  updateRule,
  type RulesOverviewResponse,
} from "@/lib/api";
import { formatDateTime, formatNumber } from "@/lib/format";

const editorFieldClassName =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function RulesControlPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("rules.view");
  const canManageRules = hasPermission("rules.manage");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftValue, setDraftValue] = useState("{}");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data, error, loading, refresh, updatedAt } =
    useAsyncData<RulesOverviewResponse>(
      () => {
        if (!session || !canViewPage) {
          return Promise.resolve(null);
        }

        return getRulesOverview();
      },
      [session?.user.id, canViewPage],
    );

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Règles totales",
          value: formatNumber(data.summary.totalRules),
        },
        {
          label: "Actives",
          value: formatNumber(data.summary.activeRules),
        },
        {
          label: "Versions listées",
          value: formatNumber(data.rules.length),
          helper: "Fenêtre récente de configuration",
        },
      ]
    : undefined;

  const filteredRules = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return data.rules;
    }

    return data.rules.filter((rule) =>
      [rule.ruleKey, rule.description ?? ""].join(" ").toLowerCase().includes(query),
    );
  }, [data, searchValue]);

  useEffect(() => {
    if (!filteredRules.length) {
      setSelectedRuleId(null);
      return;
    }

    if (!selectedRuleId || !filteredRules.some((rule) => rule.id === selectedRuleId)) {
      setSelectedRuleId(filteredRules[0]?.id ?? null);
    }
  }, [filteredRules, selectedRuleId]);

  const selectedRule =
    filteredRules.find((rule) => rule.id === selectedRuleId) ??
    data?.rules.find((rule) => rule.id === selectedRuleId) ??
    null;

  useEffect(() => {
    if (!selectedRule) {
      return;
    }

    setDraftDescription(selectedRule.description ?? "");
    setDraftValue(JSON.stringify(selectedRule.value ?? {}, null, 2));
    setFeedback(null);
  }, [selectedRule?.id]);

  const isDirty =
    selectedRule !== null &&
    (draftDescription !== (selectedRule.description ?? "") ||
      draftValue !== JSON.stringify(selectedRule.value ?? {}, null, 2));

  async function handleSaveRule() {
    if (!selectedRule || !canManageRules) {
      return;
    }

    let parsedValue: Record<string, unknown>;

    try {
      const candidate = JSON.parse(draftValue) as unknown;

      if (!candidate || Array.isArray(candidate) || typeof candidate !== "object") {
        setFeedback("La valeur doit être un objet JSON.");
        return;
      }

      parsedValue = candidate as Record<string, unknown>;
    } catch {
      setFeedback("Le JSON de configuration est invalide.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    const result = await updateRule(selectedRule.id, {
      description: draftDescription,
      value: parsedValue,
    });

    if (!result) {
      setFeedback("Impossible de versionner cette règle.");
      setSaving(false);
      return;
    }

    setFeedback(`Nouvelle version publiée pour ${result.ruleKey}.`);
    setSaving(false);
    refresh();
  }

  return (
    <OperationsPageShell
      title="Règles"
      description="Configuration versionnée des seuils A1, dispatch, pricing et autres règles métier pilotant la plateforme."
      requiredPermissions={["rules.view"]}
      loading={loading}
      updatedAt={updatedAt}
      error={canViewPage && !data ? error : null}
      onRefresh={refresh}
      metrics={metrics}
      showContent={Boolean(data)}
    >
      {data ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Catalogue des règles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Filtrer par clé ou description"
                />

                <DataTableCard
                  title="Versions récentes"
                  description="Le moteur applique la dernière version active par clé."
                  rows={filteredRules}
                  getRowKey={(row) => row.id}
                  emptyMessage="Aucune règle disponible."
                  columns={[
                    {
                      header: "Clé",
                      render: (row) => (
                        <span className="font-mono text-xs">{row.ruleKey}</span>
                      ),
                    },
                    {
                      header: "Version",
                      render: (row) => row.version ?? "—",
                    },
                    {
                      header: "Statut",
                      render: (row) => (
                        <StatusBadge value={row.isActive ? "active" : "resolved"} />
                      ),
                    },
                    {
                      header: "Début",
                      render: (row) => formatDateTime(row.effectiveFrom),
                    },
                    {
                      header: "Action",
                      render: (row) => (
                        <Button
                          variant={row.id === selectedRuleId ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedRuleId(row.id)}
                        >
                          Ouvrir
                        </Button>
                      ),
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <InfoListCard
              title="Discipline de versioning"
              description="Le backend clôture l'ancienne version et publie une nouvelle entrée append-only."
              items={[
                {
                  label: "Accès manage",
                  value: canManageRules ? "Actif" : "Lecture seule",
                  tone: canManageRules ? "success" : "warning",
                },
                {
                  label: "Règles actives",
                  value: formatNumber(data.summary.activeRules),
                },
                {
                  label: "Règles inactives",
                  value: formatNumber(data.summary.totalRules - data.summary.activeRules),
                },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Éditeur de règle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedRule ? (
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez une règle pour afficher sa configuration.
                  </p>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoListCard
                        title={selectedRule.ruleKey}
                        items={[
                          {
                            label: "Version",
                            value: selectedRule.version ?? "—",
                          },
                          {
                            label: "Statut",
                            value: <StatusBadge value={selectedRule.isActive ? "active" : "resolved"} />,
                          },
                          {
                            label: "Créée le",
                            value: formatDateTime(selectedRule.createdAt),
                          },
                          {
                            label: "Créée par",
                            value: selectedRule.createdByName ?? "—",
                          },
                        ]}
                      />

                      <InfoListCard
                        title="Calendrier"
                        items={[
                          {
                            label: "Prend effet",
                            value: formatDateTime(selectedRule.effectiveFrom),
                          },
                          {
                            label: "Clôture",
                            value: formatDateTime(selectedRule.effectiveTo),
                          },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        className={`${editorFieldClassName} min-h-24`}
                        disabled={!canManageRules || saving}
                        value={draftDescription}
                        onChange={(event) => setDraftDescription(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valeur JSON</label>
                      <textarea
                        className={`${editorFieldClassName} min-h-72 font-mono text-xs`}
                        disabled={!canManageRules || saving}
                        value={draftValue}
                        onChange={(event) => setDraftValue(event.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        disabled={!canManageRules || !isDirty || saving}
                        onClick={() => void handleSaveRule()}
                      >
                        Publier une nouvelle version
                      </Button>
                      <Button
                        variant="outline"
                        disabled={saving || !selectedRule}
                        onClick={() => {
                          if (!selectedRule) {
                            return;
                          }

                          setDraftDescription(selectedRule.description ?? "");
                          setDraftValue(JSON.stringify(selectedRule.value ?? {}, null, 2));
                          setFeedback(null);
                        }}
                      >
                        Réinitialiser
                      </Button>
                      {feedback ? (
                        <span className="text-sm text-muted-foreground">{feedback}</span>
                      ) : null}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-xl border border-border/80 bg-muted/20 p-4 text-xs leading-6 text-muted-foreground">
                  {draftValue}
                </pre>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </OperationsPageShell>
  );
}
