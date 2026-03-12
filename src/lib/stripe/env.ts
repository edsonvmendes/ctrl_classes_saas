function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getStripeSecretKey() {
  return getEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return getEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripeStarterPriceId() {
  return getEnv("STRIPE_STARTER_PRICE_ID");
}

export function getAppUrl() {
  return getEnv("NEXT_PUBLIC_APP_URL");
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_STARTER_PRICE_ID &&
      process.env.NEXT_PUBLIC_APP_URL,
  );
}
