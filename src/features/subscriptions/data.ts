import { cache } from "react";

import { redirect } from "next/navigation";

import { requireOnboardedPartner } from "@/features/partners/data";
import { hasBillingAccess } from "@/features/subscriptions/rules";
import { getPartnerContext } from "@/lib/auth/partner";
import { isStripeConfigured } from "@/lib/stripe/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SubscriptionRecord } from "@/types/subscription";

export const getSubscriptionSnapshot = cache(async (locale = "pt-BR") => {
  await requireOnboardedPartner(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, partner_id, provider, plan_code, status, stripe_customer_id, stripe_subscription_id, trial_ends_at, current_period_start, current_period_end, cancel_at_period_end, canceled_at, metadata, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Subscription not found.");
  }

  return {
    stripeConfigured: isStripeConfigured(),
    subscription: data as SubscriptionRecord,
  };
});

export const requireBillingAccess = cache(async (locale = "pt-BR") => {
  const snapshot = await getSubscriptionSnapshot(locale);

  if (!hasBillingAccess(snapshot.subscription)) {
    redirect(`/${locale}/settings?billing=required`);
  }

  return snapshot;
});
