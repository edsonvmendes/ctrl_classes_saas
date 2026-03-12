import { cache } from "react";

import { notFound, redirect } from "next/navigation";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StudentRecord } from "@/types/student";

export const getStudents = cache(async (locale = "pt-BR") => {
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, notes, status, billing_type, monthly_amount_cents, class_rate_cents, billing_day_of_month, charge_no_show, currency, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StudentRecord[];
});

export async function getStudentById(studentId: string, locale = "pt-BR") {
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, notes, status, billing_type, monthly_amount_cents, class_rate_cents, billing_day_of_month, charge_no_show, currency, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .eq("id", studentId)
    .single();

  if (error || !data) {
    notFound();
  }

  return data as StudentRecord;
}
