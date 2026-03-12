import Stripe from "stripe";

import type { SubscriptionStatus } from "@/types/subscription";

export function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "trialing") {
    return "trialing";
  }

  if (status === "active") {
    return "active";
  }

  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }

  return "canceled";
}

export function getPlanCodeFromStripeSubscription(
  subscription: Stripe.Subscription,
  starterPriceId: string,
) {
  const priceId = subscription.items.data[0]?.price.id;

  if (priceId === starterPriceId) {
    return "starter";
  }

  return subscription.metadata.plan_code || "starter";
}
