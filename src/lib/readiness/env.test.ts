import { describe, expect, it } from "vitest";

import { getEnvironmentReadiness } from "@/lib/readiness/env";

describe("environment readiness", () => {
  it("reports a fully configured environment as ok", () => {
    const readiness = getEnvironmentReadiness({
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon_123",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_STARTER_PRICE_ID: "price_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: "google-client",
      SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: "google-secret",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    });

    expect(readiness.status).toBe("ok");
    expect(readiness.summary.configured).toBe(10);
    expect(readiness.missing).toHaveLength(0);
  });

  it("marks the environment as degraded when core app configuration is missing", () => {
    const readiness = getEnvironmentReadiness({
      NEXT_PUBLIC_APP_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: "",
    });

    expect(readiness.status).toBe("degraded");
    expect(readiness.categories.app.appUrl).toBe(false);
    expect(readiness.categories.auth.supabasePublic).toBe(false);
    expect(readiness.missing).toContain("NEXT_PUBLIC_APP_URL");
    expect(readiness.missing).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });
});
