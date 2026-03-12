import { hasBillingAccess } from "@/features/subscriptions/rules";

type AuthPartnerState = {
  partner_id: string;
  onboarding_completed_at: string | null;
};

type AuthSubscriptionState = {
  current_period_end: string | null;
  status: "trialing" | "active" | "past_due" | "canceled";
  trial_ends_at: string;
} | null;

type SupabaseAuthLookup = {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
  from: (table: "partners" | "subscriptions") => {
    select: (query: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
  };
};

export function resolvePostAuthPath(
  locale: string,
  partner: AuthPartnerState | null,
  subscription: AuthSubscriptionState,
) {
  if (!partner || !partner.onboarding_completed_at) {
    return `/${locale}/onboarding`;
  }

  if (!subscription || !hasBillingAccess(subscription)) {
    return `/${locale}/settings?billing=required`;
  }

  return `/${locale}/app`;
}

export async function getPostAuthPath(locale: string, supabase: SupabaseAuthLookup) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return `/${locale}/login`;
  }

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("partner_id, onboarding_completed_at")
    .eq("user_id", user.id)
    .single();

  if (partnerError || !partner) {
    return `/${locale}/onboarding`;
  }

  if (!(partner as AuthPartnerState).onboarding_completed_at) {
    return `/${locale}/onboarding`;
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("partner_id", (partner as AuthPartnerState).partner_id)
    .single();

  if (subscriptionError || !subscription) {
    return `/${locale}/settings?billing=required`;
  }

  return resolvePostAuthPath(locale, partner as AuthPartnerState, subscription as AuthSubscriptionState);
}
