import { cache } from "react";

import { redirect } from "next/navigation";

import { getPartnerContext } from "@/lib/auth/partner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PartnerRecord } from "@/types/partner";

export const getPartnerProfile = cache(async (locale = "pt-BR") => {
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("partners")
    .select(
      "partner_id, user_id, display_name, legal_name, phone, locale, timezone, currency, teaching_mode, class_mode, onboarding_completed_at, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Partner not found.");
  }

  return data as PartnerRecord;
});

export const requireOnboardedPartner = cache(async (locale = "pt-BR") => {
  const partner = await getPartnerProfile(locale);

  if (!partner.onboarding_completed_at) {
    redirect(`/${locale}/onboarding`);
  }

  return partner;
});
