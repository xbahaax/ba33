"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentSession,
  getDevPersonas,
  getStoredAccessToken,
  loginWithDevPersona,
  setStoredAccessToken,
  type AuthSessionResponse,
  type DevPersona,
} from "@/lib/api";

type SessionContextValue = {
  hasPermission: (...permissions: string[]) => boolean;
  loading: boolean;
  personas: DevPersona[];
  refreshSession: () => Promise<void>;
  session: AuthSessionResponse | null;
  switchPersona: (
    input: { email?: string; userId?: string },
  ) => Promise<AuthSessionResponse | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, setSession] = useState<AuthSessionResponse | null>(null);
  const [personas, setPersonas] = useState<DevPersona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function hydrateSession() {
      setLoading(true);

      const availablePersonas = (await getDevPersonas()) ?? [];

      if (!active) {
        return;
      }

      setPersonas(availablePersonas);

      const existingToken = getStoredAccessToken();

      if (existingToken) {
        const currentSession = await getCurrentSession();

        if (!active) {
          return;
        }

        if (currentSession) {
          setSession(currentSession);
          setLoading(false);
          return;
        }

        setStoredAccessToken(null);
      }

      setSession(null);
      setLoading(false);
    }

    void hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      hasPermission: (...permissions) => {
        if (!session) {
          return false;
        }

        return permissions.every((permission) =>
          session.permissions.includes(permission),
        );
      },
      loading,
      personas,
      refreshSession: async () => {
        const refreshed = await getCurrentSession();

        if (refreshed) {
          setSession(refreshed);
          return;
        }

        setStoredAccessToken(null);
        setSession(null);
      },
      session,
      switchPersona: async (input) => {
        setLoading(true);
        const loginResponse = await loginWithDevPersona(input);

        if (loginResponse) {
          setStoredAccessToken(loginResponse.accessToken);
          setSession(loginResponse.session);
          setLoading(false);
          return loginResponse.session;
        }

        setLoading(false);
        return null;
      },
    }),
    [loading, personas, session],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider.");
  }

  return context;
}
