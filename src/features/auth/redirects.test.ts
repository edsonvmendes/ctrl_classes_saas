import { describe, expect, it } from "vitest";

import { getPostAuthPath, resolvePostAuthPath } from "@/features/auth/redirects";

function createSupabaseLookupMock({
  profile = { role: "teacher_admin" as const },
  profileError = null,
  partner,
  partnerError = null,
  subscription,
  subscriptionError = null,
  user = { id: "user-1" },
}: {
  profile?: unknown;
  profileError?: { message: string } | null;
  partner?: unknown;
  partnerError?: { message: string } | null;
  subscription?: unknown;
  subscriptionError?: { message: string } | null;
  user?: { id: string } | null;
}) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
    },
    from: (table: "profiles" | "partners" | "subscriptions") => ({
      select: (query: string) => ({
        eq: (column: string, value: string) => ({
          single: async () => {
            void query;
            void column;
            void value;
            if (table === "profiles") {
              return { data: profile ?? null, error: profileError };
            }

            return table === "partners"
              ? { data: partner ?? null, error: partnerError }
              : { data: subscription ?? null, error: subscriptionError };
          },
        }),
      }),
    }),
  };
}

describe("post-auth redirects", () => {
  it("sends users without onboarding completion to onboarding", () => {
    expect(
      resolvePostAuthPath(
        "pt-BR",
        { role: "teacher_admin" },
        {
          onboarding_completed_at: null,
          partner_id: "partner-1",
        },
        {
          current_period_end: null,
          status: "trialing",
          trial_ends_at: "2026-04-01T00:00:00.000Z",
        },
      ),
    ).toBe("/pt-BR/onboarding");
  });

  it("sends onboarded users without billing access to settings", () => {
    expect(
      resolvePostAuthPath(
        "pt-BR",
        { role: "teacher_admin" },
        {
          onboarding_completed_at: "2026-03-10T00:00:00.000Z",
          partner_id: "partner-1",
        },
        {
          current_period_end: null,
          status: "past_due",
          trial_ends_at: "2026-03-01T00:00:00.000Z",
        },
      ),
    ).toBe("/pt-BR/settings?billing=required");
  });

  it("sends onboarded users with billing access to the app", () => {
    expect(
      resolvePostAuthPath(
        "pt-BR",
        { role: "teacher_admin" },
        {
          onboarding_completed_at: "2026-03-10T00:00:00.000Z",
          partner_id: "partner-1",
        },
        {
          current_period_end: null,
          status: "trialing",
          trial_ends_at: "2026-04-01T00:00:00.000Z",
        },
      ),
    ).toBe("/pt-BR/app");
  });

  it("sends users without a session back to login during callback resolution", async () => {
    await expect(
      getPostAuthPath(
        "pt-BR",
        createSupabaseLookupMock({
          user: null,
        }),
      ),
    ).resolves.toBe("/pt-BR/login");
  });

  it("sends god users to the GOD control panel", () => {
    expect(
      resolvePostAuthPath(
        "pt-BR",
        { role: "god" },
        null,
        null,
      ),
    ).toBe("/pt-BR/god");
  });

  it("routes god users to the GOD control panel during callback resolution", async () => {
    await expect(
      getPostAuthPath(
        "pt-BR",
        createSupabaseLookupMock({
          profile: { role: "god" },
        }),
      ),
    ).resolves.toBe("/pt-BR/god");
  });

  it("falls back to onboarding when partner lookup fails", async () => {
    await expect(
      getPostAuthPath(
        "pt-BR",
        createSupabaseLookupMock({
          partnerError: { message: "Partner missing" },
        }),
      ),
    ).resolves.toBe("/pt-BR/onboarding");
  });

  it("falls back to billing required when subscription lookup fails", async () => {
    await expect(
      getPostAuthPath(
        "pt-BR",
        createSupabaseLookupMock({
          partner: {
            onboarding_completed_at: "2026-03-10T00:00:00.000Z",
            partner_id: "partner-1",
          },
          subscriptionError: { message: "Subscription missing" },
        }),
      ),
    ).resolves.toBe("/pt-BR/settings?billing=required");
  });
});
