import { cache } from "react";

import { requireGod } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PartnerBaseRow = {
  created_at: string;
  currency: "BRL" | "USD" | "EUR";
  display_name: string;
  locale: "pt-BR" | "en-US" | "es-ES";
  onboarding_completed_at: string | null;
  partner_id: string;
  timezone: string;
  updated_at: string;
  user_id: string;
};

type ProfileBaseRow = {
  email: string;
  full_name: string;
  id: string;
};

type SubscriptionBaseRow = {
  current_period_end: string | null;
  partner_id: string;
  plan_code: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid";
  trial_ends_at: string;
  updated_at: string;
};

type StudentBaseRow = {
  partner_id: string;
  status: "active" | "inactive" | "archived";
};

type PaymentBaseRow = {
  due_date: string;
  partner_id: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
};

type ClassBaseRow = {
  partner_id: string;
  starts_at: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
};

type GodTenantSummary = {
  activeStudents: number;
  classesToday: number;
  createdAt: string;
  currency: "BRL" | "USD" | "EUR";
  displayName: string;
  email: string;
  locale: "pt-BR" | "en-US" | "es-ES";
  onboardingCompletedAt: string | null;
  ownerName: string;
  partnerId: string;
  pendingPayments: number;
  planCode: string | null;
  subscriptionStatus: SubscriptionBaseRow["status"] | "missing";
  timezone: string;
};

function getUtcDayRange() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { end, start };
}

function incrementCounter(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function buildTenantSummaries({
  classRows,
  partnerRows,
  paymentRows,
  profileRows,
  studentRows,
  subscriptionRows,
}: {
  classRows: ClassBaseRow[];
  partnerRows: PartnerBaseRow[];
  paymentRows: PaymentBaseRow[];
  profileRows: ProfileBaseRow[];
  studentRows: StudentBaseRow[];
  subscriptionRows: SubscriptionBaseRow[];
}) {
  const profilesById = new Map(profileRows.map((profile) => [profile.id, profile]));
  const subscriptionsByPartnerId = new Map(subscriptionRows.map((subscription) => [subscription.partner_id, subscription]));
  const activeStudentsByPartnerId = new Map<string, number>();
  const pendingPaymentsByPartnerId = new Map<string, number>();
  const classesTodayByPartnerId = new Map<string, number>();

  for (const student of studentRows) {
    if (student.status === "active") {
      incrementCounter(activeStudentsByPartnerId, student.partner_id);
    }
  }

  for (const payment of paymentRows) {
    if (payment.status === "pending" || payment.status === "overdue") {
      incrementCounter(pendingPaymentsByPartnerId, payment.partner_id);
    }
  }

  for (const classRow of classRows) {
    incrementCounter(classesTodayByPartnerId, classRow.partner_id);
  }

  return partnerRows.map((partner) => {
    const profile = profilesById.get(partner.user_id);
    const subscription = subscriptionsByPartnerId.get(partner.partner_id);

    return {
      activeStudents: activeStudentsByPartnerId.get(partner.partner_id) ?? 0,
      classesToday: classesTodayByPartnerId.get(partner.partner_id) ?? 0,
      createdAt: partner.created_at,
      currency: partner.currency,
      displayName: partner.display_name,
      email: profile?.email ?? "-",
      locale: partner.locale,
      onboardingCompletedAt: partner.onboarding_completed_at,
      ownerName: profile?.full_name ?? partner.display_name,
      partnerId: partner.partner_id,
      pendingPayments: pendingPaymentsByPartnerId.get(partner.partner_id) ?? 0,
      planCode: subscription?.plan_code ?? null,
      subscriptionStatus: subscription?.status ?? "missing",
      timezone: partner.timezone,
    } satisfies GodTenantSummary;
  });
}

export const getGodDashboardSnapshot = cache(async (locale = "pt-BR") => {
  const currentProfile = await requireGod(locale);
  const supabase = await createSupabaseServerClient();
  const { start: todayStart, end: todayEnd } = getUtcDayRange();

  const [
    partnersResult,
    activeSubscriptionsResult,
    trialingSubscriptionsResult,
    pastDueSubscriptionsResult,
    onboardedPartnersResult,
    studentsResult,
    todayClassesResult,
    pendingPaymentsResult,
    recentPartnersResult,
    watchlistSubscriptionsResult,
    watchlistOnboardingResult,
  ] = await Promise.all([
    supabase.from("partners").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "trialing"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "past_due"),
    supabase.from("partners").select("*", { count: "exact", head: true }).not("onboarding_completed_at", "is", null),
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .gte("starts_at", todayStart.toISOString())
      .lt("starts_at", todayEnd.toISOString()),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "overdue"]),
    supabase
      .from("partners")
      .select("partner_id, user_id, display_name, locale, timezone, currency, onboarding_completed_at, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("subscriptions")
      .select("partner_id, plan_code, status, trial_ends_at, current_period_end, updated_at")
      .eq("status", "past_due")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("partners")
      .select("partner_id, user_id, display_name, locale, timezone, currency, onboarding_completed_at, created_at, updated_at")
      .is("onboarding_completed_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  for (const result of [
    partnersResult,
    activeSubscriptionsResult,
    trialingSubscriptionsResult,
    pastDueSubscriptionsResult,
    onboardedPartnersResult,
    studentsResult,
    todayClassesResult,
    pendingPaymentsResult,
    recentPartnersResult,
    watchlistSubscriptionsResult,
    watchlistOnboardingResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const recentPartnerRows = (recentPartnersResult.data ?? []) as PartnerBaseRow[];
  const watchlistSubscriptionRows = (watchlistSubscriptionsResult.data ?? []) as SubscriptionBaseRow[];
  const watchlistOnboardingRows = (watchlistOnboardingResult.data ?? []) as PartnerBaseRow[];
  const highlightedPartnerIds = Array.from(
    new Set([
      ...recentPartnerRows.map((partner) => partner.partner_id),
      ...watchlistSubscriptionRows.map((subscription) => subscription.partner_id),
      ...watchlistOnboardingRows.map((partner) => partner.partner_id),
    ]),
  );

  const [highlightedPartnersResult, highlightedSubscriptionsResult] = await Promise.all([
    highlightedPartnerIds.length > 0
      ? supabase
          .from("partners")
          .select("partner_id, user_id, display_name, locale, timezone, currency, onboarding_completed_at, created_at, updated_at")
          .in("partner_id", highlightedPartnerIds)
      : Promise.resolve({ data: [], error: null }),
    highlightedPartnerIds.length > 0
      ? supabase
          .from("subscriptions")
          .select("partner_id, plan_code, status, trial_ends_at, current_period_end, updated_at")
          .in("partner_id", highlightedPartnerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (highlightedPartnersResult.error) {
    throw new Error(highlightedPartnersResult.error.message);
  }

  if (highlightedSubscriptionsResult.error) {
    throw new Error(highlightedSubscriptionsResult.error.message);
  }

  const highlightedPartnerRows = (highlightedPartnersResult.data ?? []) as PartnerBaseRow[];
  const highlightedUserIds = Array.from(new Set(highlightedPartnerRows.map((partner) => partner.user_id)));
  const { data: highlightedProfilesData, error: highlightedProfilesError } = highlightedUserIds.length > 0
    ? await supabase.from("profiles").select("id, email, full_name").in("id", highlightedUserIds)
    : { data: [], error: null };

  if (highlightedProfilesError) {
    throw new Error(highlightedProfilesError.message);
  }

  const highlightedProfiles = (highlightedProfilesData ?? []) as ProfileBaseRow[];

  const recentTenants = buildTenantSummaries({
    classRows: [],
    partnerRows: recentPartnerRows,
    paymentRows: [],
    profileRows: highlightedProfiles,
    studentRows: [],
    subscriptionRows: (highlightedSubscriptionsResult.data ?? []) as SubscriptionBaseRow[],
  });

  const watchlistPastDue = buildTenantSummaries({
    classRows: [],
    partnerRows: highlightedPartnerRows.filter((partner) =>
      watchlistSubscriptionRows.some((subscription) => subscription.partner_id === partner.partner_id),
    ),
    paymentRows: [],
    profileRows: highlightedProfiles,
    studentRows: [],
    subscriptionRows: watchlistSubscriptionRows,
  });

  const watchlistOnboarding = buildTenantSummaries({
    classRows: [],
    partnerRows: watchlistOnboardingRows,
    paymentRows: [],
    profileRows: highlightedProfiles,
    studentRows: [],
    subscriptionRows: (highlightedSubscriptionsResult.data ?? []) as SubscriptionBaseRow[],
  });

  return {
    metrics: {
      activeSubscriptions: activeSubscriptionsResult.count ?? 0,
      onboardedPartners: onboardedPartnersResult.count ?? 0,
      partners: partnersResult.count ?? 0,
      pastDueSubscriptions: pastDueSubscriptionsResult.count ?? 0,
      pendingPayments: pendingPaymentsResult.count ?? 0,
      students: studentsResult.count ?? 0,
      todayClasses: todayClassesResult.count ?? 0,
      trialingSubscriptions: trialingSubscriptionsResult.count ?? 0,
    },
    recentTenants,
    user: currentProfile.profile,
    watchlist: {
      onboarding: watchlistOnboarding,
      pastDue: watchlistPastDue,
    },
  };
});

export const getGodTenantsSnapshot = cache(async (locale = "pt-BR") => {
  await requireGod(locale);
  const supabase = await createSupabaseServerClient();
  const { start: todayStart, end: todayEnd } = getUtcDayRange();

  const { data: partnerData, error: partnerError } = await supabase
    .from("partners")
    .select("partner_id, user_id, display_name, locale, timezone, currency, onboarding_completed_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(60);

  if (partnerError) {
    throw new Error(partnerError.message);
  }

  const partnerRows = (partnerData ?? []) as PartnerBaseRow[];
  const userIds = partnerRows.map((partner) => partner.user_id);
  const partnerIds = partnerRows.map((partner) => partner.partner_id);

  const [profilesResult, subscriptionsResult, studentsResult, paymentsResult, classesResult] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("id, email, full_name").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    partnerIds.length > 0
      ? supabase
          .from("subscriptions")
          .select("partner_id, plan_code, status, trial_ends_at, current_period_end, updated_at")
          .in("partner_id", partnerIds)
      : Promise.resolve({ data: [], error: null }),
    partnerIds.length > 0
      ? supabase.from("students").select("partner_id, status").in("partner_id", partnerIds)
      : Promise.resolve({ data: [], error: null }),
    partnerIds.length > 0
      ? supabase.from("payments").select("partner_id, status, due_date").in("partner_id", partnerIds)
      : Promise.resolve({ data: [], error: null }),
    partnerIds.length > 0
      ? supabase
          .from("classes")
          .select("partner_id, status, starts_at")
          .in("partner_id", partnerIds)
          .gte("starts_at", todayStart.toISOString())
          .lt("starts_at", todayEnd.toISOString())
      : Promise.resolve({ data: [], error: null }),
  ]);

  for (const result of [profilesResult, subscriptionsResult, studentsResult, paymentsResult, classesResult]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const tenants = buildTenantSummaries({
    classRows: (classesResult.data ?? []) as ClassBaseRow[],
    partnerRows,
    paymentRows: (paymentsResult.data ?? []) as PaymentBaseRow[],
    profileRows: (profilesResult.data ?? []) as ProfileBaseRow[],
    studentRows: (studentsResult.data ?? []) as StudentBaseRow[],
    subscriptionRows: (subscriptionsResult.data ?? []) as SubscriptionBaseRow[],
  });

  return {
    summary: {
      missingSubscription: tenants.filter((tenant) => tenant.subscriptionStatus === "missing").length,
      pastDue: tenants.filter((tenant) => tenant.subscriptionStatus === "past_due").length,
      total: tenants.length,
      withoutOnboarding: tenants.filter((tenant) => !tenant.onboardingCompletedAt).length,
    },
    tenants,
  };
});
