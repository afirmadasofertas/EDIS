import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Forward pathname to layouts via header so server components can branch on route.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase env vars the auth gate cannot run. Skip it (let the
  // request through) instead of crashing the entire site with
  // MIDDLEWARE_INVOCATION_FAILED. The dashboard layout still hard-blocks
  // unauthenticated access on the server, so this is safe.
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[middleware] Supabase env vars missing — skipping auth gate. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes → redirect to login if no session
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/drive") ||
    pathname.startsWith("/aulas") ||
    pathname.startsWith("/swipe-files") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/space") ||
    pathname.startsWith("/crow-ai") ||
    pathname.startsWith("/usage") ||
    pathname.startsWith("/settings");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Auth pages → redirect to dashboard if already logged in
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
