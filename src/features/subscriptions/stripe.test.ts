import { describe, expect, it } from "vitest";

import { getPlanCodeFromStripeSubscription, mapStripeStatus } from "@/features/subscriptions/stripe";

describe("subscription stripe helpers", () => {
  it("maps stripe statuses to local statuses", () => {
    expect(mapStripeStatus("trialing")).toBe("trialing");
    expect(mapStripeStatus("active")).toBe("active");
    expect(mapStripeStatus("past_due")).toBe("past_due");
    expect(mapStripeStatus("unpaid")).toBe("past_due");
    expect(mapStripeStatus("canceled")).toBe("canceled");
  });

  it("derives starter plan code from matching price id", () => {
    const subscription = {
      items: {
        data: [{ price: { id: "price_starter" } }],
      },
      metadata: {},
    } as Parameters<typeof getPlanCodeFromStripeSubscription>[0];

    expect(getPlanCodeFromStripeSubscription(subscription, "price_starter")).toBe("starter");
  });
});
