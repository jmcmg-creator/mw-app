import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth"];
const MFA_BYPASS_PATHS = [...PUBLIC_PATHS, "/verify-2fa"];

function startsWithAny(pathname: string, paths: string[]): boolean {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function redirectTo(
  request: NextRequest,
  target: string,
  cookieSource: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = target;
  const redirect = NextResponse.redirect(url);
  for (const cookie of cookieSource.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export async function middleware(request: NextRequest) {
  const { response, user, needsMfa } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (!user && !startsWithAny(path, PUBLIC_PATHS)) {
    return redirectTo(request, "/login", response);
  }

  if (user && needsMfa && !startsWithAny(path, MFA_BYPASS_PATHS)) {
    return redirectTo(request, "/verify-2fa", response);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets and image files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
