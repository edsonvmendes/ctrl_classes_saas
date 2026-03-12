export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type SubscriptionRecord = {
  id: string;
  partner_id: string;
  provider: "stripe";
  plan_code: string;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
