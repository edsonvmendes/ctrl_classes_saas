import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPostAuthPath } from "@/features/auth/redirects";
import { createRequestId, logServerEvent } from "@/lib/observability/logger";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

export async function GET(request: NextRequest) {
  const requestId = createRequestId();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const locale = requestUrl.searchParams.get("locale") ?? "pt-BR";
  const next = requestUrl.searchParams.get("next");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  const response = new NextResponse(null, {
    headers: {
      "x-ctrl-request-id": requestId,
    },
  });
  response.headers.set("x-ctrl-request-id", requestId);

  if (!code) {
    logServerEvent({
      data: { locale, next },
      event: "missing_code",
      level: "warn",
      requestId,
      scope: "auth.callback",
    });

    const redirectResponse = NextResponse.redirect(new URL(next ?? `/${locale}/login`, request.url));
    redirectResponse.headers.set("x-ctrl-request-id", requestId);
    return redirectResponse;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logServerEvent({
      data: { locale, message: error.message },
      event: "exchange_failed",
      level: "error",
      requestId,
      scope: "auth.callback",
    });

    const redirectResponse = NextResponse.redirect(
      new URL(`/${locale}/login?error=${encodeURIComponent(error.message)}`, request.url),
    );
    redirectResponse.headers.set("x-ctrl-request-id", requestId);
    return redirectResponse;
  }

  const destination =
    next ??
    (await getPostAuthPath(
      locale,
      supabase as unknown as Parameters<typeof getPostAuthPath>[1],
    ));

  const sanitizedDestination = destination.startsWith("/") ? destination : `/${locale}/app`;
  const redirectBase = isLocalEnv
    ? requestUrl.origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : requestUrl.origin;

  logServerEvent({
    data: { destination: sanitizedDestination, locale, next },
    event: "exchange_succeeded",
    requestId,
    scope: "auth.callback",
  });

  const redirectResponse = NextResponse.redirect(new URL(sanitizedDestination, redirectBase), {
    headers: response.headers,
  });
  copyCookies(response, redirectResponse);
  redirectResponse.headers.set("x-ctrl-request-id", requestId);
  return redirectResponse;
}
