"use server";

import { redirect } from "next/navigation";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { createRequestId, logServerError, logServerEvent } from "@/lib/observability/logger";
import type { PaymentFilter } from "@/features/payments/data";
import {
  buildMonthlyPaymentPayload,
  buildPerClassPaymentPayload,
  shiftMonth,
  toReferenceMonth,
} from "@/features/payments/generation";
import { zonedLocalDateTimeToUtc } from "@/lib/datetime/timezone";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export async function generateMonthlyPaymentsAction(
  locale: string,
  month: string,
  _status: PaymentFilter,
  _prevState: GeneratePaymentsActionState,
  _formData: FormData,
): Promise<GeneratePaymentsActionState> {
  const requestId = createRequestId();
  void _status;
  void _prevState;
  void _formData;

  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const referenceMonth = toReferenceMonth(month);
  const nextReferenceMonth = toReferenceMonth(shiftMonth(month, 1));

  const { data: monthlyStudents, error: monthlyStudentsError } = await supabase
    .from("students")
    .select(
      "id, full_name, status, billing_type, monthly_amount_cents, billing_day_of_month, currency",
    )
    .eq("partner_id", partner.partnerId)
    .eq("status", "active")
    .eq("billing_type", "monthly");

  if (monthlyStudentsError) {
    logServerError({
      data: {
        locale,
        month,
        partnerId: partner.partnerId,
      },
      error: monthlyStudentsError,
      event: "payments_generate_monthly_students_lookup_failed",
      requestId,
      scope: "payments.actions",
    });
    throw new Error(monthlyStudentsError.message);
  }

  const eligibleMonthlyStudents = (monthlyStudents ?? []).filter(
    (student) => student.monthly_amount_cents && student.billing_day_of_month,
  );

  const { data: perClassStudents, error: perClassStudentsError } = await supabase
    .from("students")
    .select(
      "id, full_name, status, billing_type, class_rate_cents, charge_no_show, currency",
    )
    .eq("partner_id", partner.partnerId)
    .eq("status", "active")
    .eq("billing_type", "per_class");

  if (perClassStudentsError) {
    logServerError({
      data: {
        locale,
        month,
        partnerId: partner.partnerId,
      },
      error: perClassStudentsError,
      event: "payments_generate_per_class_students_lookup_failed",
      requestId,
      scope: "payments.actions",
    });
    throw new Error(perClassStudentsError.message);
  }

  const eligiblePerClassStudents = (perClassStudents ?? []).filter(
    (student) => student.class_rate_cents,
  );

  if (eligibleMonthlyStudents.length === 0 && eligiblePerClassStudents.length === 0) {
    return { success: true };
  }

  const { data: existingPayments, error: existingPaymentsError } = await supabase
    .from("payments")
    .select("student_id, class_id")
    .eq("partner_id", partner.partnerId)
    .eq("reference_month", referenceMonth)
    .in(
      "student_id",
      [...eligibleMonthlyStudents, ...eligiblePerClassStudents].map((student) => student.id),
    );

  if (existingPaymentsError) {
    logServerError({
      data: {
        locale,
        month,
        partnerId: partner.partnerId,
      },
      error: existingPaymentsError,
      event: "payments_generate_existing_lookup_failed",
      requestId,
      scope: "payments.actions",
    });
    throw new Error(existingPaymentsError.message);
  }

  const existingMonthlyStudentIds = new Set(
    (existingPayments ?? [])
      .filter((payment) => payment.class_id === null)
      .map((payment) => payment.student_id),
  );
  const existingClassIds = new Set(
    (existingPayments ?? [])
      .filter((payment) => payment.class_id !== null)
      .map((payment) => payment.class_id as string),
  );

  const monthlyPayload = buildMonthlyPaymentPayload({
    existingMonthlyStudentIds,
    month,
    partnerId: partner.partnerId,
    referenceMonth,
    students: eligibleMonthlyStudents.map((student) => ({
      billing_day_of_month: student.billing_day_of_month,
      currency: student.currency,
      id: student.id,
      monthly_amount_cents: student.monthly_amount_cents,
    })),
  });

  const monthRangeStart = zonedLocalDateTimeToUtc(referenceMonth, "00:00:00", partner.timezone);
  const monthRangeEnd = zonedLocalDateTimeToUtc(nextReferenceMonth, "00:00:00", partner.timezone);

  let perClassPayload: Array<{
    amount_cents: number;
    class_id: string | null;
    currency: string;
    due_date: string;
    notes: string;
    partner_id: string;
    reference_month: string;
    status: PaymentStatus;
    student_id: string;
  }> = [];

  if (eligiblePerClassStudents.length > 0) {
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("id, student_id, status, starts_at, title")
      .eq("partner_id", partner.partnerId)
      .gte("starts_at", monthRangeStart.toISOString())
      .lt("starts_at", monthRangeEnd.toISOString())
      .in(
        "student_id",
        eligiblePerClassStudents.map((student) => student.id),
      )
      .in("status", ["completed", "no_show"]);

    if (classesError) {
      logServerError({
        data: {
          locale,
          month,
          partnerId: partner.partnerId,
        },
        error: classesError,
        event: "payments_generate_classes_lookup_failed",
        requestId,
        scope: "payments.actions",
      });
      throw new Error(classesError.message);
    }

    perClassPayload = buildPerClassPaymentPayload({
      classes: (classes ?? []).map((classItem) => ({
        id: classItem.id,
        starts_at: classItem.starts_at,
        status: classItem.status,
        student_id: classItem.student_id,
      })),
      existingClassIds,
      partnerId: partner.partnerId,
      partnerTimezone: partner.timezone,
      referenceMonth,
      students: eligiblePerClassStudents.map((student) => ({
        charge_no_show: student.charge_no_show,
        class_rate_cents: student.class_rate_cents,
        currency: student.currency,
        id: student.id,
      })),
    });
  }

  const payload = [...monthlyPayload, ...perClassPayload];

  if (payload.length > 0) {
    const { error: insertError } = await supabase.from("payments").insert(payload);

    if (insertError) {
      logServerError({
        data: {
          locale,
          month,
          partnerId: partner.partnerId,
          payloadCount: payload.length,
        },
        error: insertError,
        event: "payments_generate_insert_failed",
        requestId,
        scope: "payments.actions",
      });
      return { error: insertError.message };
    }
  }

  logServerEvent({
    data: {
      generatedCount: payload.length,
      locale,
      month,
      partnerId: partner.partnerId,
    },
    event: "payments_generated",
    requestId,
    scope: "payments.actions",
  });

  return { success: true };
}

export async function settlePaymentAction(
  locale: string,
  paymentId: string,
  _month: string,
  _status: PaymentFilter,
  _prevState: SettlePaymentActionState,
  formData: FormData,
): Promise<SettlePaymentActionState> {
  const requestId = createRequestId();
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const method = String(formData.get("method") ?? "pix") as PaymentMethod;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("payments")
    .update({
      method,
      paid_at: new Date().toISOString(),
      status: "paid" satisfies PaymentStatus,
    })
    .eq("id", paymentId)
    .eq("partner_id", partner.partnerId);

  if (error) {
    logServerError({
      data: {
        locale,
        method,
        partnerId: partner.partnerId,
        paymentId,
      },
      error,
      event: "payment_settle_failed",
      requestId,
      scope: "payments.actions",
    });
    return { error: error.message };
  }

  logServerEvent({
    data: {
      locale,
      method,
      partnerId: partner.partnerId,
      paymentId,
    },
    event: "payment_settled",
    requestId,
    scope: "payments.actions",
  });

  return { success: true };
}

export type SettlePaymentActionState = {
  error?: string;
  success?: boolean;
};

export type GeneratePaymentsActionState = {
  error?: string;
  success?: boolean;
};
