import Stripe from "stripe";

import {
  buildSubscriptionUpdateFromStripe,
  getStripePartnerId,
  isHandledStripeWebhookEvent,
} from "@/features/subscriptions/webhook";
import { createRequestId, logServerEvent } from "@/lib/observability/logger";
import { getStripeStarterPriceId, getStripeWebhookSecret, isStripeConfigured } from "@/lib/stripe/env";
import { createStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function upsertSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackPartnerId?: string | null,
) {
  const supabase = createSupabaseAdminClient();
  const customerId = String(subscription.customer);
  const partnerId = getStripePartnerId(subscription, fallbackPartnerId ? { partner_id: fallbackPartnerId } : null);

  const existingQuery = supabase
    .from("subscriptions")
    .select("id, partner_id, trial_ends_at")
    .or(`stripe_customer_id.eq.${customerId},stripe_subscription_id.eq.${subscription.id}`)
    .limit(1);

  const { data: existingByStripe, error: existingByStripeError } = await existingQuery.maybeSingle();

  if (existingByStripeError) {
    throw new Error(existingByStripeError.message);
  }

  let existing = existingByStripe;

  if (!existing && partnerId) {
    const { data: existingByPartner, error: existingByPartnerError } = await supabase
      .from("subscriptions")
      .select("id, partner_id, trial_ends_at")
      .eq("partner_id", partnerId)
      .single();

    if (existingByPartnerError) {
      throw new Error(existingByPartnerError.message);
    }

    existing = existingByPartner;
  }

  if (!existing) {
    throw new Error("Subscription record not found for Stripe event.");
  }

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update(buildSubscriptionUpdateFromStripe(subscription, getStripeStarterPriceId(), existing.trial_ends_at))
    .eq("id", existing.id)
    .eq("partner_id", existing.partner_id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  console.info("[stripe-webhook] subscription synced", {
    customerId,
    eventPartnerId: partnerId,
    localPartnerId: existing.partner_id,
    status: subscription.status,
    subscriptionId: subscription.id,
  });
}

export async function POST(request: Request) {
  const requestId = createRequestId();

  if (!isStripeConfigured()) {
    logServerEvent({
      event: "not_configured",
      level: "error",
      requestId,
      scope: "api.stripe.webhook",
    });

    return new Response("Stripe not configured.", {
      headers: { "x-ctrl-request-id": requestId },
      status: 500,
    });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    logServerEvent({
      event: "missing_signature",
      level: "warn",
      requestId,
      scope: "api.stripe.webhook",
    });

    return new Response("Missing Stripe signature.", {
      headers: { "x-ctrl-request-id": requestId },
      status: 400,
    });
  }

  const stripe = createStripeServerClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    logServerEvent({
      data: {
        message: error instanceof Error ? error.message : "Unable to verify Stripe signature.",
      },
      event: "signature_verification_failed",
      level: "error",
      requestId,
      scope: "api.stripe.webhook",
    });

    return new Response(
      error instanceof Error ? error.message : "Unable to verify Stripe signature.",
      {
        headers: { "x-ctrl-request-id": requestId },
        status: 400,
      },
    );
  }

  try {
    logServerEvent({
      data: { eventId: event.id, type: event.type },
      event: "received",
      requestId,
      scope: "api.stripe.webhook",
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
          await upsertSubscriptionFromStripe(subscription, session.metadata?.partner_id ?? null);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
        break;
      default:
        if (!isHandledStripeWebhookEvent(event.type)) {
          logServerEvent({
            data: { eventId: event.id, type: event.type },
            event: "ignored",
            requestId,
            scope: "api.stripe.webhook",
          });
        }
        break;
    }
  } catch (error) {
    logServerEvent({
      data: {
        error: error instanceof Error ? error.message : "Unknown webhook handling error.",
        eventId: event.id,
        type: event.type,
      },
      event: "failed",
      level: "error",
      requestId,
      scope: "api.stripe.webhook",
    });
    return new Response(error instanceof Error ? error.message : "Webhook handling failed.", {
      headers: { "x-ctrl-request-id": requestId },
      status: 500,
    });
  }

  return Response.json(
    { received: true, requestId },
    {
      headers: { "x-ctrl-request-id": requestId },
    },
  );
}
