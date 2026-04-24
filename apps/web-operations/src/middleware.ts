import { type NextRequest, NextResponse } from "next/server";

const ROLE_HOME_ROUTES: Record<string, string> = {
  central_admin: "/admin",
  regional_manager: "/admin",
  certification_authority: "/admin",
  depot_manager: "/depot",
  laverie_operator: "/laverie",
  transformer_operator: "/transformation",
  sales_agent: "/sales",
};

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  central_admin: ["/admin"],
  regional_manager: ["/admin"],
  certification_authority: ["/admin"],
  depot_manager: ["/depot"],
  laverie_operator: ["/laverie"],
  transformer_operator: ["/transformation"],
  sales_agent: ["/sales"],
};

function decodeUserType(token: string): string | null {
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

function getHomeRoute(userType: string): string {
  return ROLE_HOME_ROUTES[userType] ?? "/login";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_ba33_api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ba33-token")?.value ?? null;
  const userType = token ? decodeUserType(token) : null;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!token || !userType) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[userType] ?? [];
  const isAllowed =
    pathname === "/" ||
    allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowed) {
    return NextResponse.redirect(
      new URL(getHomeRoute(userType), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|_ba33_api).*)"],
};
