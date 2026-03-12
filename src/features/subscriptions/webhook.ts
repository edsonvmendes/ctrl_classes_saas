import Stripe from "stripe";

import { getPlanCodeFromStripeSubscription, mapStripeStatus } from "@/features/subscriptions/stripe";

export function getStripePartnerId(
  subscription: Stripe.Subscription,
  fallbackMetadata?: Stripe.Metadata | null,
) {
  return subscription.metadata.partner_id || fallbackMetadata?.partner_id || null;
}

export function buildSubscriptionUpdateFromStripe(
  subscription: Stripe.Subscription,
  starterPriceId: string,
  existingTrialEndsAt: string,
) {
  const firstItem = subscription.items.data[0];

  return {
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    current_period_end: firstItem?.current_period_end
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null,
    current_period_start: firstItem?.current_period_start
      ? new Date(firstItem.current_period_start * 1000).toISOString()
      : null,
    metadata: subscription.metadata,
    plan_code: getPlanCodeFromStripeSubscription(subscription, starterPriceId),
    status: mapStripeStatus(subscription.status),
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    trial_ends_at: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : existingTrialEndsAt,
  };
}

export function isHandledStripeWebhookEvent(eventType: Stripe.Event.Type) {
  return (
    eventType === "checkout.session.completed" ||
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated" ||
    eventType === "customer.subscription.deleted"
  );
}
