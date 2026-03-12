import { describe, expect, it } from "vitest";

import { buildBetaReadinessSnapshot } from "@/features/settings/readiness";

describe("settings readiness snapshot", () => {
  it("aggregates an operationally ready environment", () => {
    const snapshot = buildBetaReadinessSnapshot({
      database: {
        configured: true,
        error: null,
        reachable: true,
        status: "ok",
      },
      environment: {
        categories: {
          app: {
            appUrl: true,
          },
          auth: {
            googleOAuth: true,
            supabasePublic: true,
            supabaseServiceRole: true,
          },
          billing: {
            stripeCore: true,
            stripePublishable: true,
            stripeWebhook: true,
          },
        },
        missing: [],
        status: "ok",
        summary: {
          configured: 10,
          total: 10,
        },
      },
      providers: {
        appUrl: "https://ctrl-classes.app",
        defaultLocale: "pt-BR",
        google: {
          authorizedRedirectUri: "https://project.supabase.co/auth/v1/callback",
          clientIdConfigured: true,
          clientSecretConfigured: true,
        },
        stripe: {
          checkoutCancelUrl: "https://ctrl-classes.app/pt-BR/settings?billing=canceled",
          checkoutSuccessUrl: "https://ctrl-classes.app/pt-BR/settings?billing=success",
          webhookUrl: "https://ctrl-classes.app/api/stripe/webhook",
        },
        supabase: {
          additionalRedirectUrls: [
            "https://ctrl-classes.app/auth/callback?locale=pt-BR",
            "https://ctrl-classes.app/auth/callback?locale=en-US",
          ],
          siteUrl: "https://ctrl-classes.app",
        },
      },
    });

    expect(snapshot.overallStatus).toBe("ok");
    expect(snapshot.sections).toHaveLength(3);
    expect(snapshot.sections[1]?.items).toHaveLength(3);
    expect(snapshot.references[2]?.value).toBe("https://project.supabase.co/auth/v1/callback");
  });

  it("marks the snapshot as needing attention when environment or database are not ready", () => {
    const snapshot = buildBetaReadinessSnapshot({
      database: {
        configured: true,
        error: "connection failed",
        reachable: false,
        status: "degraded",
      },
      environment: {
        categories: {
          app: {
            appUrl: false,
          },
          auth: {
            googleOAuth: false,
            supabasePublic: false,
            supabaseServiceRole: false,
          },
          billing: {
            stripeCore: false,
            stripePublishable: false,
            stripeWebhook: false,
          },
        },
        missing: [
          "NEXT_PUBLIC_APP_URL",
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "SUPABASE_SERVICE_ROLE_KEY",
        ],
        status: "degraded",
        summary: {
          configured: 0,
          total: 10,
        },
      },
      providers: {
        appUrl: null,
        defaultLocale: "pt-BR",
        google: {
          authorizedRedirectUri: null,
          clientIdConfigured: false,
          clientSecretConfigured: false,
        },
        stripe: {
          checkoutCancelUrl: null,
          checkoutSuccessUrl: null,
          webhookUrl: null,
        },
        supabase: {
          additionalRedirectUrls: [],
          siteUrl: null,
        },
      },
    });

    expect(snapshot.overallStatus).toBe("attention");
    expect(snapshot.sections[0]?.items[0]?.configured).toBe(false);
    expect(snapshot.database.error).toBe("connection failed");
    expect(snapshot.references.every((reference) => reference.value === null)).toBe(true);
  });
});
