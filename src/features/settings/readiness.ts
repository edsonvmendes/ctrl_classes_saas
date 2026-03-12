import { cache } from "react";

import { getEnvironmentReadiness } from "@/lib/readiness/env";
import { getProviderReadiness } from "@/lib/readiness/providers";
import { checkDatabaseReadiness } from "@/lib/readiness/runtime";

type EnvironmentSnapshot = ReturnType<typeof getEnvironmentReadiness>;
type ProviderSnapshot = ReturnType<typeof getProviderReadiness>;
type DatabaseSnapshot = Awaited<ReturnType<typeof checkDatabaseReadiness>>;

type ReadinessSection = {
  items: Array<{
    configured: boolean;
    key:
      | "appUrl"
      | "googleOAuth"
      | "stripeCore"
      | "stripePublishable"
      | "stripeWebhook"
      | "supabasePublic"
      | "supabaseServiceRole";
  }>;
  key: "app" | "auth" | "billing";
};

type ReadinessReference = {
  key:
    | "appUrl"
    | "googleRedirect"
    | "stripeCancel"
    | "stripeSuccess"
    | "stripeWebhook"
    | "supabaseSiteUrl";
  value: string | null;
};

export type BetaReadinessSnapshot = ReturnType<typeof buildBetaReadinessSnapshot>;

export function buildBetaReadinessSnapshot({
  database,
  environment,
  providers,
}: {
  database: DatabaseSnapshot;
  environment: EnvironmentSnapshot;
  providers: ProviderSnapshot;
}) {
  const sections: ReadinessSection[] = [
    {
      items: [{ configured: environment.categories.app.appUrl, key: "appUrl" }],
      key: "app",
    },
    {
      items: [
        { configured: environment.categories.auth.supabasePublic, key: "supabasePublic" },
        { configured: environment.categories.auth.supabaseServiceRole, key: "supabaseServiceRole" },
        { configured: environment.categories.auth.googleOAuth, key: "googleOAuth" },
      ],
      key: "auth",
    },
    {
      items: [
        { configured: environment.categories.billing.stripeCore, key: "stripeCore" },
        { configured: environment.categories.billing.stripePublishable, key: "stripePublishable" },
        { configured: environment.categories.billing.stripeWebhook, key: "stripeWebhook" },
      ],
      key: "billing",
    },
  ];

  const references: ReadinessReference[] = [
    { key: "appUrl", value: providers.appUrl },
    { key: "supabaseSiteUrl", value: providers.supabase.siteUrl },
    { key: "googleRedirect", value: providers.google.authorizedRedirectUri },
    { key: "stripeWebhook", value: providers.stripe.webhookUrl },
    { key: "stripeSuccess", value: providers.stripe.checkoutSuccessUrl },
    { key: "stripeCancel", value: providers.stripe.checkoutCancelUrl },
  ];

  return {
    cliCommand: "npm run readiness",
    database,
    environment,
    healthEndpoint: "/api/health",
    overallStatus: environment.status === "ok" && database.status === "ok" ? "ok" : "attention",
    references,
    sections,
  };
}

export const getBetaReadinessSnapshot = cache(async () =>
  buildBetaReadinessSnapshot({
    database: await checkDatabaseReadiness(),
    environment: getEnvironmentReadiness(),
    providers: getProviderReadiness(),
  }),
);
