type EnvironmentReadiness = {
  categories: {
    app: {
      appUrl: boolean;
    };
    auth: {
      googleOAuth: boolean;
      supabasePublic: boolean;
      supabaseServiceRole: boolean;
    };
    billing: {
      stripeCore: boolean;
      stripePublishable: boolean;
      stripeWebhook: boolean;
    };
  };
  missing: string[];
  status: "ok" | "degraded";
  summary: {
    configured: number;
    total: number;
  };
};

const checks = [
  { key: "NEXT_PUBLIC_APP_URL", path: ["app", "appUrl"] as const },
  { key: "NEXT_PUBLIC_SUPABASE_URL", path: ["auth", "supabasePublic"] as const },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", path: ["auth", "supabasePublic"] as const },
  { key: "SUPABASE_SERVICE_ROLE_KEY", path: ["auth", "supabaseServiceRole"] as const },
  { key: "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID", path: ["auth", "googleOAuth"] as const },
  { key: "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET", path: ["auth", "googleOAuth"] as const },
  { key: "STRIPE_SECRET_KEY", path: ["billing", "stripeCore"] as const },
  { key: "STRIPE_STARTER_PRICE_ID", path: ["billing", "stripeCore"] as const },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", path: ["billing", "stripePublishable"] as const },
  { key: "STRIPE_WEBHOOK_SECRET", path: ["billing", "stripeWebhook"] as const },
];

export function getEnvironmentReadiness(env: NodeJS.ProcessEnv = process.env): EnvironmentReadiness {
  const readiness: EnvironmentReadiness = {
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
      configured: 0,
      total: checks.length,
    },
  };

  for (const check of checks) {
    const isConfigured = Boolean(env[check.key]);

    if (isConfigured) {
      readiness.summary.configured += 1;
      continue;
    }

    if (check.path[0] === "app") {
      readiness.categories.app[check.path[1]] = false;
    }

    if (check.path[0] === "auth") {
      readiness.categories.auth[check.path[1]] = false;
    }

    if (check.path[0] === "billing") {
      readiness.categories.billing[check.path[1]] = false;
    }

    readiness.missing.push(check.key);
  }

  if (
    !readiness.categories.app.appUrl ||
    !readiness.categories.auth.supabasePublic ||
    !readiness.categories.auth.supabaseServiceRole
  ) {
    readiness.status = "degraded";
  }

  return readiness;
}
