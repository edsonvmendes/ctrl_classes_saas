import { describe, expect, it } from "vitest";

import { getProviderReadiness, getSupabaseAuthCallbackUrl } from "@/lib/readiness/providers";

describe("provider readiness", () => {
  it("builds the expected provider URLs from app and supabase env", () => {
    const readiness = getProviderReadiness({
      NEXT_PUBLIC_APP_URL: "https://ctrl-classes.app/",
      NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co/",
      SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: "google-client",
      SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: "google-secret",
    });

    expect(readiness.supabase.siteUrl).toBe("https://ctrl-classes.app");
    expect(readiness.supabase.additionalRedirectUrls).toEqual([
      "https://ctrl-classes.app/auth/callback?locale=pt-BR",
      "https://ctrl-classes.app/auth/callback?locale=en-US",
      "https://ctrl-classes.app/auth/callback?locale=es-ES",
    ]);
    expect(readiness.google.authorizedRedirectUri).toBe(
      "https://project-ref.supabase.co/auth/v1/callback",
    );
    expect(readiness.stripe.webhookUrl).toBe("https://ctrl-classes.app/api/stripe/webhook");
  });

  it("returns nulls when the required env is absent", () => {
    const readiness = getProviderReadiness({});

    expect(readiness.appUrl).toBeNull();
    expect(readiness.supabase.siteUrl).toBeNull();
    expect(readiness.supabase.additionalRedirectUrls).toEqual([]);
    expect(readiness.google.authorizedRedirectUri).toBeNull();
  });

  it("builds the hosted supabase auth callback url", () => {
    expect(getSupabaseAuthCallbackUrl("https://project.supabase.co/")).toBe(
      "https://project.supabase.co/auth/v1/callback",
    );
  });
});
