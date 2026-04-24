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
  getUserAccessOverview,
  updateUserAccess,
  type UserAccessOverviewResponse,
} from "@/lib/api";
import { formatDateTime, formatEnumLabel, formatNumber } from "@/lib/format";

const editorFieldClassName =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function PermissionChips({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-sm text-muted-foreground">Aucune permission.</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

export function AccessControlPage() {
  const { hasPermission, session } = useSession();
  const canViewPage = hasPermission("users.view");
  const canManageRbac = hasPermission("rbac.manage");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [draftStatus, setDraftStatus] = useState<"active" | "suspended" | "deleted">(
    "active",
  );
  const [draftRoleIds, setDraftRoleIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data, error, loading, refresh, updatedAt } =
    useAsyncData<UserAccessOverviewResponse>(
      () => {
        if (!session || !canViewPage) {
          return Promise.resolve(null);
        }

        return getUserAccessOverview();
      },
      [session?.user.id, canViewPage],
    );

  const metrics: OperationsMetric[] | undefined = data
    ? [
        {
          label: "Utilisateurs",
          value: formatNumber(data.summary.totalUsers),
        },
        {
          label: "Actifs",
          value: formatNumber(data.summary.activeUsers),
        },
        {
          label: "Suspendus",
          value: formatNumber(data.summary.suspendedUsers),
        },
        {
          label: "Web operations",
          value: formatNumber(data.summary.webOperationsUsers),
          helper: "Profils avec permissions effectives",
        },
      ]
    : undefined;

  const filteredUsers = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return data.users;
    }

    return data.users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.userType,
        user.regionName ?? "",
        user.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data, searchValue]);

  useEffect(() => {
    if (!filteredUsers.length) {
      setSelectedUserId(null);
      return;
    }

    if (!selectedUserId || !filteredUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(filteredUsers[0]?.id ?? null);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedUserId) ??
    data?.users.find((user) => user.id === selectedUserId) ??
    null;

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setDraftStatus(selectedUser.status as "active" | "suspended" | "deleted");
    setDraftRoleIds(selectedUser.assignedRoles.map((role) => role.id));
    setFeedback(null);
  }, [selectedUser?.id]);

  const roleCatalog = data?.roles ?? [];
  const selectedRoleIds = selectedUser?.assignedRoles.map((role) => role.id) ?? [];
  const isDirty =
    selectedUser !== null &&
    (draftStatus !== selectedUser.status || !arraysEqual(draftRoleIds, selectedRoleIds));

  async function handleSaveAccess() {
    if (!selectedUser || !canManageRbac) {
      return;
    }

    setSaving(true);
    setFeedback(null);

    const result = await updateUserAccess(selectedUser.id, {
      roleIds: draftRoleIds,
      status: draftStatus,
    });

    if (!result) {
      setFeedback("Impossible d'enregistrer les changements RBAC.");
      setSaving(false);
      return;
    }

    setFeedback(`Accès mis à jour pour ${result.fullName}.`);
    setSaving(false);
    refresh();
  }

  function toggleRole(roleId: string) {
    setDraftRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((value) => value !== roleId)
        : [...current, roleId],
    );
  }

  return (
    <OperationsPageShell
      title="Accès & RBAC"
      description="Gouvernance des profils opérateurs, overlays de rôles et permissions effectives du centre NFN."
      requiredPermissions={["users.view"]}
      loading={loading}
      updatedAt={updatedAt}
      error={canViewPage && !data ? error : null}
      onRefresh={refresh}
      metrics={metrics}
      showContent={Boolean(data)}
    >
      {data ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Répertoire accès</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Filtrer par nom, email, type, région ou statut"
                />

                <DataTableCard
                  title="Utilisateurs"
                  description="Sélectionnez un profil pour lire ou ajuster ses overlays."
                  rows={filteredUsers}
                  getRowKey={(row) => row.id}
                  emptyMessage="Aucun utilisateur ne correspond au filtre."
                  columns={[
                    {
                      header: "Profil",
                      render: (row) => (
                        <div className="space-y-1">
                          <div className="font-medium">{row.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.email}
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Type",
                      render: (row) => formatEnumLabel(row.userType),
                    },
                    {
                      header: "Statut",
                      render: (row) => <StatusBadge value={row.status} />,
                    },
                    {
                      header: "Rôles",
                      render: (row) => row.assignedRoles.length,
                    },
                    {
                      header: "Perms",
                      render: (row) => row.effectivePermissions.length,
                    },
                    {
                      header: "Action",
                      render: (row) => (
                        <Button
                          variant={row.id === selectedUserId ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedUserId(row.id)}
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
              title="Catalogue des rôles"
              description="Templates appliqués comme overlays sur les permissions de base."
              items={roleCatalog.map((role) => ({
                label: role.name,
                value: `${role.permissions?.length ?? 0} perms`,
                helper: role.permissions?.join(", ") ?? "Aucune permission",
              }))}
              emptyMessage="Aucun rôle disponible."
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Éditeur d'accès</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedUser ? (
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez un utilisateur pour afficher ses droits.
                  </p>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoListCard
                        title={selectedUser.fullName}
                        items={[
                          {
                            label: "Email",
                            value: selectedUser.email,
                          },
                          {
                            label: "Type métier",
                            value: formatEnumLabel(selectedUser.userType),
                          },
                          {
                            label: "Région",
                            value: selectedUser.regionName ?? "—",
                          },
                          {
                            label: "Dernière connexion",
                            value: formatDateTime(selectedUser.lastLoginAt),
                          },
                        ]}
                      />

                      <Card>
                        <CardHeader>
                          <CardTitle>Contrôles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Statut compte</label>
                            <select
                              className={editorFieldClassName}
                              disabled={!canManageRbac || saving}
                              value={draftStatus}
                              onChange={(event) =>
                                setDraftStatus(
                                  event.target.value as "active" | "suspended" | "deleted",
                                )
                              }
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                              <option value="deleted">Deleted</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            <p className="text-sm font-medium">Overlays de rôles</p>
                            <div className="space-y-2">
                              {roleCatalog.map((role) => (
                                <label
                                  key={role.id}
                                  className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/80 px-3 py-3"
                                >
                                  <input
                                    type="checkbox"
                                    checked={draftRoleIds.includes(role.id)}
                                    disabled={!canManageRbac || saving}
                                    onChange={() => toggleRole(role.id)}
                                    className="mt-1"
                                  />
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">{role.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(role.permissions ?? []).join(", ") || "Aucune permission"}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <Button
                              disabled={!canManageRbac || !isDirty || saving}
                              onClick={() => void handleSaveAccess()}
                            >
                              Enregistrer
                            </Button>
                            <Button
                              variant="outline"
                              disabled={saving}
                              onClick={() => {
                                if (!selectedUser) {
                                  return;
                                }

                                setDraftStatus(
                                  selectedUser.status as "active" | "suspended" | "deleted",
                                );
                                setDraftRoleIds(
                                  selectedUser.assignedRoles.map((role) => role.id),
                                );
                                setFeedback(null);
                              }}
                            >
                              Réinitialiser
                            </Button>
                            {feedback ? (
                              <span className="text-sm text-muted-foreground">{feedback}</span>
                            ) : null}
                          </div>

                          {!canManageRbac ? (
                            <p className="text-sm text-muted-foreground">
                              Ce profil a un accès lecture seule sur la matrice RBAC.
                            </p>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Permissions de base</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <PermissionChips values={selectedUser.baselinePermissions} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Permissions effectives</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <PermissionChips values={selectedUser.effectivePermissions} />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <InfoListCard
              title="Statuts opérateurs"
              description="Vue synthétique des comptes affichés dans le filtre courant."
              items={[
                {
                  label: "Profils filtrés",
                  value: formatNumber(filteredUsers.length),
                },
                {
                  label: "Profils actifs",
                  value: formatNumber(
                    filteredUsers.filter((user) => user.status === "active").length,
                  ),
                },
                {
                  label: "Profils suspendus",
                  value: formatNumber(
                    filteredUsers.filter((user) => user.status === "suspended").length,
                  ),
                },
                {
                  label: "Dernière mise à jour",
                  value: updatedAt ? formatDateTime(new Date(updatedAt).toISOString()) : "—",
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </OperationsPageShell>
  );
}
