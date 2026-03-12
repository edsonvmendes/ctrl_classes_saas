import Stripe from "stripe";

import { getStripeSecretKey } from "@/lib/stripe/env";

export function createStripeServerClient() {
  return new Stripe(getStripeSecretKey());
}
