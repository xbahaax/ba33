import { INSTITUTIONS, type Institution } from "./mock-data";

const SESSION_KEY = "ba33_institutional_session";

export interface Session {
  institutionId: string;
  userEmail: string;
  userName: string;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getInstitution(id: string): Institution | undefined {
  return INSTITUTIONS.find((i) => i.id === id);
}

export function isModuleAllowed(
  institutionId: string,
  module: string
): boolean {
  const inst = getInstitution(institutionId);
  return inst?.allowedModules.includes(module) ?? false;
}

// Demo credentials — any institution can log in with these
export const DEMO_CREDENTIALS: Record<
  string,
  { email: string; name: string }
> = {
  "min-agri": { email: "b.khelifa@madr.gov.dz", name: "Brahim Khelifa" },
  "min-com": { email: "n.hamdi@mincom.gov.dz", name: "Nadia Hamdi" },
  dgd: { email: "r.bensalem@dgd.gov.dz", name: "Riad Bensalem" },
  ons: { email: "a.zerrouki@ons.gov.dz", name: "Amina Zerrouki" },
};
