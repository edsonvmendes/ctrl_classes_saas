import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import {
  buildSubscriptionUpdateFromStripe,
  getStripePartnerId,
  isHandledStripeWebhookEvent,
} from "@/features/subscriptions/webhook";

function toUnix(value: string) {
  return Math.floor(new Date(value).getTime() / 1000);
}

function createStripeSubscription(overrides: Partial<Stripe.Subscription> = {}) {
  return {
    cancel_at_period_end: false,
    canceled_at: null,
    customer: "cus_123",
    id: "sub_123",
    items: {
      data: [
        {
          current_period_end: toUnix("2026-04-08T00:00:00.000Z"),
          current_period_start: toUnix("2026-03-09T00:00:00.000Z"),
          price: { id: "price_starter" },
        },
      ],
    },
    metadata: { partner_id: "partner_123" },
    status: "active",
    trial_end: toUnix("2026-03-02T00:00:00.000Z"),
    ...overrides,
  } as unknown as Stripe.Subscription;
}

describe("subscription webhook helpers", () => {
  it("builds the local subscription update payload from stripe data", () => {
    const payload = buildSubscriptionUpdateFromStripe(
      createStripeSubscription(),
      "price_starter",
      "2026-04-07T10:26:37.295Z",
    );

    expect(payload.plan_code).toBe("starter");
    expect(payload.status).toBe("active");
    expect(payload.stripe_customer_id).toBe("cus_123");
    expect(payload.stripe_subscription_id).toBe("sub_123");
    expect(payload.current_period_start).toBe("2026-03-09T00:00:00.000Z");
    expect(payload.current_period_end).toBe("2026-04-08T00:00:00.000Z");
    expect(payload.trial_ends_at).toBe("2026-03-02T00:00:00.000Z");
  });

  it("falls back to the existing trial end when stripe no longer sends one", () => {
    const payload = buildSubscriptionUpdateFromStripe(
      createStripeSubscription({ trial_end: null }),
      "price_starter",
      "2026-04-07T10:26:37.295Z",
    );

    expect(payload.trial_ends_at).toBe("2026-04-07T10:26:37.295Z");
  });

  it("maps canceled subscriptions even when no current item is present", () => {
    const payload = buildSubscriptionUpdateFromStripe(
      createStripeSubscription({
        canceled_at: toUnix("2026-03-20T00:00:00.000Z"),
        items: { data: [] } as Stripe.ApiList<Stripe.SubscriptionItem>,
        status: "canceled",
      }),
      "price_starter",
      "2026-04-07T10:26:37.295Z",
    );

    expect(payload.status).toBe("canceled");
    expect(payload.canceled_at).toBe("2026-03-20T00:00:00.000Z");
    expect(payload.current_period_start).toBeNull();
    expect(payload.current_period_end).toBeNull();
  });

  it("extracts partner id from subscription metadata or fallback metadata", () => {
    expect(getStripePartnerId(createStripeSubscription())).toBe("partner_123");
    expect(
      getStripePartnerId(createStripeSubscription({ metadata: {} }), {
        partner_id: "partner_fallback",
      } as Stripe.Metadata),
    ).toBe("partner_fallback");
    expect(getStripePartnerId(createStripeSubscription({ metadata: {} }), null)).toBeNull();
  });

  it("marks only the implemented stripe webhook events as handled", () => {
    expect(isHandledStripeWebhookEvent("checkout.session.completed")).toBe(true);
    expect(isHandledStripeWebhookEvent("customer.subscription.updated")).toBe(true);
    expect(isHandledStripeWebhookEvent("invoice.payment_succeeded")).toBe(false);
  });
});
