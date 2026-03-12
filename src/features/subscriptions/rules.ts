import type { SubscriptionRecord } from "@/types/subscription";

type BillingAccessSubscription = Pick<
  SubscriptionRecord,
  "current_period_end" | "status" | "trial_ends_at"
>;

export function hasBillingAccess(subscription: BillingAccessSubscription, now = new Date()) {
  if (subscription.status === "active") {
    return true;
  }

  if (subscription.status === "trialing") {
    return new Date(subscription.trial_ends_at).getTime() > now.getTime();
  }

  if (subscription.status === "canceled" && subscription.current_period_end) {
    return new Date(subscription.current_period_end).getTime() > now.getTime();
  }

  return false;
}
