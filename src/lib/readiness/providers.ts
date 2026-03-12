import { defaultLocale, locales } from "@/i18n/routing";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getSupabaseAuthCallbackUrl(supabaseUrl: string | undefined) {
  if (!supabaseUrl) {
    return null;
  }

  return `${trimTrailingSlash(supabaseUrl)}/auth/v1/callback`;
}

export function getProviderReadiness(env: NodeJS.ProcessEnv = process.env) {
  const appUrl = env.NEXT_PUBLIC_APP_URL ? trimTrailingSlash(env.NEXT_PUBLIC_APP_URL) : null;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ? trimTrailingSlash(env.NEXT_PUBLIC_SUPABASE_URL) : null;
  const authCallbackUrls = appUrl
    ? locales.map((locale) => `${appUrl}/auth/callback?locale=${locale}`)
    : [];

  return {
    appUrl,
    defaultLocale,
    google: {
      clientIdConfigured: Boolean(env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID),
      clientSecretConfigured: Boolean(env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET),
      authorizedRedirectUri: getSupabaseAuthCallbackUrl(supabaseUrl ?? undefined),
    },
    stripe: {
      checkoutSuccessUrl: appUrl ? `${appUrl}/${defaultLocale}/settings?billing=success` : null,
      checkoutCancelUrl: appUrl ? `${appUrl}/${defaultLocale}/settings?billing=canceled` : null,
      webhookUrl: appUrl ? `${appUrl}/api/stripe/webhook` : null,
    },
    supabase: {
      additionalRedirectUrls: unique(authCallbackUrls),
      siteUrl: appUrl,
    },
  };
}
