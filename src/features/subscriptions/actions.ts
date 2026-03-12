"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireOnboardedPartner } from "@/features/partners/data";
import { getSubscriptionSnapshot } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { getAppUrl, getStripeStarterPriceId, isStripeConfigured } from "@/lib/stripe/env";
import { createStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SubscriptionActionState = {
  error?: string;
};

async function getSubscriptionMessages(locale: string) {
  const t = await getTranslations({ locale, namespace: "Subscription" });

  return {
    errorCheckout: t("errorCheckout"),
    errorCustomerMissing: t("errorCustomerMissing"),
    errorNotReady: t("errorNotReady"),
    errorPortal: t("errorPortal"),
  };
}

async function ensureStripeCustomer(locale: string, partnerId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found.");
  }

  const { subscription } = await getSubscriptionSnapshot(locale);

  if (subscription.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }

  const stripe = createStripeServerClient();
  const customer = await stripe.customers.create({
    email: profile.email,
    metadata: {
      partner_id: partnerId,
      user_id: userId,
    },
    name: profile.full_name,
  });

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({ stripe_customer_id: customer.id })
    .eq("id", subscription.id)
    .eq("partner_id", partnerId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return customer.id;
}

export async function startCheckoutAction(
  locale: string,
  previousState: SubscriptionActionState,
): Promise<SubscriptionActionState> {
  void previousState;
  const messages = await getSubscriptionMessages(locale);
  await requireOnboardedPartner(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  if (!isStripeConfigured()) {
    return {
      error: messages.errorNotReady,
    };
  }

  const customerId = await ensureStripeCustomer(locale, partner.partnerId, partner.userId);
  const stripe = createStripeServerClient();
  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    cancel_url: `${getAppUrl()}/${locale}/settings?billing=canceled`,
    customer: customerId,
    line_items: [
      {
        price: getStripeStarterPriceId(),
        quantity: 1,
      },
    ],
    metadata: {
      partner_id: partner.partnerId,
      plan_code: "starter",
    },
    mode: "subscription",
    success_url: `${getAppUrl()}/${locale}/settings?billing=success`,
  });

  if (!session.url) {
    return {
      error: messages.errorCheckout,
    };
  }

  redirect(session.url);
}

export async function openCustomerPortalAction(
  locale: string,
  previousState: SubscriptionActionState,
): Promise<SubscriptionActionState> {
  void previousState;
  const messages = await getSubscriptionMessages(locale);
  await requireOnboardedPartner(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  if (!isStripeConfigured()) {
    return {
      error: messages.errorNotReady,
    };
  }

  const { subscription } = await getSubscriptionSnapshot(locale);

  if (!subscription.stripe_customer_id) {
    return {
      error: messages.errorCustomerMissing,
    };
  }

  const stripe = createStripeServerClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${getAppUrl()}/${locale}/settings`,
  });

  if (!session.url) {
    return {
      error: messages.errorPortal,
    };
  }

  redirect(session.url);
}
