"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, cn } from "@ba33/ui-web";
import { LogIn } from "lucide-react";
import {
  getDevPersonas,
  loginWithDevPersona,
  setStoredAccessToken,
  type DevPersona,
} from "@/lib/api";
import { getHomeRoute } from "@/lib/role-routing";

const ROLE_LABELS: Record<string, string> = {
  central_admin: "Administrateur central",
  regional_manager: "Gestionnaire regional",
  certification_authority: "Autorite de certification",
  depot_manager: "Gestionnaire depot",
  laverie_operator: "Operateur laverie",
  transformer_operator: "Operateur transformation",
  sales_agent: "Agent commercial",
  collector: "Collecteur",
  transporter: "Transporteur",
  shepherd: "Berger",
};

const ROLE_ORDER = [
  "central_admin",
  "regional_manager",
  "certification_authority",
  "depot_manager",
  "laverie_operator",
  "transformer_operator",
  "sales_agent",
  "collector",
  "transporter",
  "shepherd",
];

function groupByUserType(personas: DevPersona[]) {
  const groups = new Map<string, DevPersona[]>();

  for (const persona of personas) {
    const existing = groups.get(persona.userType) ?? [];
    existing.push(persona);
    groups.set(persona.userType, existing);
  }

  return ROLE_ORDER
    .filter((role) => groups.has(role))
    .map((role) => ({
      userType: role,
      label: ROLE_LABELS[role] ?? role,
      personas: groups.get(role)!,
    }));
}

export function LoginPersonaPicker() {
  const [personas, setPersonas] = useState<DevPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getDevPersonas();
      setPersonas(result ?? []);
      setLoading(false);
    }

    void load();
  }, []);

  async function handleLogin(persona: DevPersona) {
    setLoggingIn(persona.id);

    const result = await loginWithDevPersona({ email: persona.email });

    if (!result) {
      setLoggingIn(null);
      return;
    }

    setStoredAccessToken(result.accessToken);
    window.location.href = getHomeRoute(result.session.user.userType);
  }

  const groups = groupByUserType(personas);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-md">
            b
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              ba33 Operations
            </h1>
            <p className="text-sm text-muted-foreground">
              Selectionnez un profil pour acceder a votre espace de travail
            </p>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
              Chargement des profils...
            </CardContent>
          </Card>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
              Aucun profil operateur disponible.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.userType}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {group.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.personas.map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      disabled={loggingIn !== null}
                      onClick={() => void handleLogin(persona)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-lg border border-border/80 bg-background px-4 py-3 text-left transition-colors hover:bg-accent",
                        loggingIn === persona.id && "opacity-70",
                      )}
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{persona.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {persona.email}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                        {loggingIn === persona.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        ) : (
                          <LogIn className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
