export const ROLE_HOME_ROUTES: Record<string, string> = {
  central_admin: "/admin",
  regional_manager: "/admin",
  certification_authority: "/admin",
  depot_manager: "/depot",
  laverie_operator: "/laverie",
  transformer_operator: "/transformation",
  sales_agent: "/sales",
};

export const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  central_admin: ["/admin"],
  regional_manager: ["/admin"],
  certification_authority: ["/admin"],
  depot_manager: ["/depot"],
  laverie_operator: ["/laverie"],
  transformer_operator: ["/transformation"],
  sales_agent: ["/sales"],
};

export function getHomeRoute(userType: string): string {
  return ROLE_HOME_ROUTES[userType] ?? "/login";
}

export function decodeUserTypeFromJwt(token: string): string | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as { type?: string };
    return payload.type ?? null;
  } catch {
    return null;
  }
}
