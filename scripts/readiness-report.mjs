import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function getSupabaseAuthCallbackUrl(supabaseUrl) {
  if (!supabaseUrl) {
    return null;
  }

  return `${trimTrailingSlash(supabaseUrl)}/auth/v1/callback`;
}

const locales = ["pt-BR", "en-US", "es-ES"];
const defaultLocale = "pt-BR";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ? trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL) : null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? trimTrailingSlash(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const readiness = {
  appUrl,
  googleRedirectUri: getSupabaseAuthCallbackUrl(supabaseUrl),
  stripeWebhookUrl: appUrl ? `${appUrl}/api/stripe/webhook` : null,
  stripeCancelUrl: appUrl ? `${appUrl}/${defaultLocale}/settings?billing=canceled` : null,
  stripeSuccessUrl: appUrl ? `${appUrl}/${defaultLocale}/settings?billing=success` : null,
  supabaseRedirectUrls: appUrl
    ? locales.map((locale) => `${appUrl}/auth/callback?locale=${locale}`)
    : [],
};

console.log("CTRL_Classes beta readiness");
console.log("");
console.log(`App URL: ${readiness.appUrl ?? "missing NEXT_PUBLIC_APP_URL"}`);
console.log(`Supabase Site URL: ${readiness.appUrl ?? "missing NEXT_PUBLIC_APP_URL"}`);
console.log(
  `Google authorized redirect URI: ${readiness.googleRedirectUri ?? "missing NEXT_PUBLIC_SUPABASE_URL"}`,
);
console.log(`Stripe webhook URL: ${readiness.stripeWebhookUrl ?? "missing NEXT_PUBLIC_APP_URL"}`);
console.log(`Stripe success URL: ${readiness.stripeSuccessUrl ?? "missing NEXT_PUBLIC_APP_URL"}`);
console.log(`Stripe cancel URL: ${readiness.stripeCancelUrl ?? "missing NEXT_PUBLIC_APP_URL"}`);
console.log("");
console.log("Supabase additional redirect URLs:");

if (readiness.supabaseRedirectUrls.length === 0) {
  console.log("- missing NEXT_PUBLIC_APP_URL");
} else {
  for (const url of readiness.supabaseRedirectUrls) {
    console.log(`- ${url}`);
  }
}
