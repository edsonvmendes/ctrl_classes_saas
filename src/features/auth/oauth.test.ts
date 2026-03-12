import { describe, expect, it } from "vitest";

import {
  getGoogleOAuthRedirectTo,
  getGoogleOAuthStartErrorPath,
  getGoogleOAuthUnavailablePath,
  isGoogleOAuthConfigured,
  isSupabaseBrowserAuthConfigured,
} from "@/features/auth/oauth";

describe("google oauth readiness", () => {
  it("returns true when both environment variables are configured", () => {
    expect(
      isGoogleOAuthConfigured({
        SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: "client-id",
        SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: "client-secret",
      }),
    ).toBe(true);
  });

  it("returns false when any required variable is missing", () => {
    expect(
      isGoogleOAuthConfigured({
        SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: "client-id",
      }),
    ).toBe(false);

    expect(
      isGoogleOAuthConfigured({
        SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET: "client-secret",
      }),
    ).toBe(false);
  });

  it("checks whether public Supabase browser auth variables are configured", () => {
    expect(
      isSupabaseBrowserAuthConfigured({
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toBe(true);

    expect(
      isSupabaseBrowserAuthConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toBe(false);
  });

  it("builds the app callback URL used by Supabase OAuth", () => {
    expect(getGoogleOAuthRedirectTo("pt-BR", "http://localhost:3000")).toBe(
      "http://localhost:3000/auth/callback?locale=pt-BR",
    );
  });

  it("builds deterministic login fallback paths", () => {
    expect(getGoogleOAuthUnavailablePath("pt-BR")).toBe(
      "/pt-BR/login?error=O%20acesso%20com%20Google%20ainda%20n%C3%A3o%20est%C3%A1%20dispon%C3%ADvel%20neste%20ambiente.",
    );
    expect(getGoogleOAuthStartErrorPath("pt-BR", "provider failed")).toBe(
      "/pt-BR/login?error=provider%20failed",
    );
  });
});
