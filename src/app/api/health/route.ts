import { NextResponse } from "next/server";

import { createRequestId, logServerEvent } from "@/lib/observability/logger";
import { getEnvironmentReadiness } from "@/lib/readiness/env";
import { getProviderReadiness } from "@/lib/readiness/providers";
import { checkDatabaseReadiness } from "@/lib/readiness/runtime";

export async function GET() {
  const requestId = createRequestId();
  const readiness = getEnvironmentReadiness();
  const providers = getProviderReadiness();
  const database = await checkDatabaseReadiness();
  const status =
    readiness.status === "degraded" || database.status === "degraded" ? "degraded" : "ok";

  logServerEvent({
    data: {
      databaseStatus: database.status,
      environmentStatus: readiness.status,
      missing: readiness.missing,
      status,
    },
    event: "health_check",
    requestId,
    scope: "api.health",
  });

  const response = NextResponse.json({
    checks: readiness.categories,
    database,
    environment: {
      missing: readiness.missing,
      summary: readiness.summary,
    },
    providers,
    requestId,
    service: "ctrl-classes-saas",
    status,
    timestamp: new Date().toISOString(),
  });

  response.headers.set("x-ctrl-request-id", requestId);

  return response;
}
