import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/reset-password"];
const AUTH_ROUTES = ["/login", "/reset-password"];
const WORKER_PREFIXES = [
  "/dashboard",
  "/jobs",
  "/applications",
  "/profile",
  "/wallet",
  "/messages",
  "/network",
  "/company",
];
const EMPLOYER_PREFIX = "/employer";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { user, supabase, response } = await updateSession(request);

  // Public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (user && pathname === "/") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const dest =
        profile?.role === "employer" ? "/employer/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  // Auth routes: redirect if already logged in
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const dest =
        profile?.role === "employer" ? "/employer/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  // Not authenticated -> redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based routing
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role === "worker" && pathname.startsWith(EMPLOYER_PREFIX)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    role === "employer" &&
    WORKER_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/employer/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|icons).*)"],
};
