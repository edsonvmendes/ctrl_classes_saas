import { describe, expect, it } from "vitest";

import { hasBillingAccess } from "@/features/subscriptions/rules";
import type { SubscriptionRecord } from "@/types/subscription";

function buildSubscription(overrides: Partial<SubscriptionRecord>): SubscriptionRecord {
  return {
    cancel_at_period_end: false,
    canceled_at: null,
    created_at: "2026-03-07T00:00:00.000Z",
    current_period_end: null,
    current_period_start: null,
    id: "sub-1",
    metadata: {},
    partner_id: "partner-1",
    plan_code: "starter",
    provider: "stripe",
    status: "trialing",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    trial_ends_at: "2026-03-20T00:00:00.000Z",
    updated_at: "2026-03-07T00:00:00.000Z",
    ...overrides,
  };
}

describe("subscription access rules", () => {
  it("allows active and valid trial subscriptions", () => {
    expect(hasBillingAccess(buildSubscription({ status: "active" }))).toBe(true);
    expect(
      hasBillingAccess(buildSubscription({ status: "trialing" }), new Date("2026-03-10T00:00:00.000Z")),
    ).toBe(true);
  });

  it("blocks expired trial and past due subscriptions", () => {
    expect(
      hasBillingAccess(buildSubscription({ status: "trialing" }), new Date("2026-03-25T00:00:00.000Z")),
    ).toBe(false);
    expect(hasBillingAccess(buildSubscription({ status: "past_due" }))).toBe(false);
  });

  it("allows canceled subscriptions only until the current period ends", () => {
    expect(
      hasBillingAccess(
        buildSubscription({
          current_period_end: "2026-03-15T00:00:00.000Z",
          status: "canceled",
        }),
        new Date("2026-03-10T00:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      hasBillingAccess(
        buildSubscription({
          current_period_end: "2026-03-15T00:00:00.000Z",
          status: "canceled",
        }),
        new Date("2026-03-20T00:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
