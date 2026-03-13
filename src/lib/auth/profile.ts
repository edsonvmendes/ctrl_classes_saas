import { cache } from "react";

import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppPartnerSummary, AppProfileRecord, CurrentAppProfile } from "@/types/profile";

export const getCurrentAppProfile = cache(async (): Promise<CurrentAppProfile | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: partner, error: partnerError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, email, full_name, avatar_url, phone, locale")
      .eq("id", user.id)
      .single(),
    supabase
      .from("partners")
      .select("partner_id, user_id, display_name, timezone, currency, onboarding_completed_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (profileError || !profile) {
    return null;
  }

  if (partnerError) {
    throw new Error(partnerError.message);
  }

  return {
    partner: (partner ?? null) as AppPartnerSummary | null,
    profile: profile as AppProfileRecord,
  };
});

export async function requireAuthenticatedAppProfile(locale: string) {
  const currentProfile = await getCurrentAppProfile();

  if (!currentProfile) {
    redirect(`/${locale}/login`);
  }

  return currentProfile;
}

export async function requireGod(locale: string) {
  const currentProfile = await requireAuthenticatedAppProfile(locale);

  if (currentProfile.profile.role !== "god") {
    notFound();
  }

  return currentProfile;
}

export async function requireTeacherAdmin(locale: string) {
  const currentProfile = await requireAuthenticatedAppProfile(locale);

  if (currentProfile.profile.role === "god") {
    redirect(`/${locale}/god`);
  }

  if (currentProfile.profile.role !== "teacher_admin") {
    notFound();
  }

  return currentProfile;
}
