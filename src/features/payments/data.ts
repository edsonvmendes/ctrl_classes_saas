import { redirect } from "next/navigation";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { getCurrentMonthInTimeZone, getTodayInTimeZone } from "@/lib/datetime/timezone";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentRecord, PaymentStatus } from "@/types/payment";

export type PaymentFilter = PaymentStatus | "all";

function toReferenceMonth(month: string) {
  return `${month}-01`;
}

function shiftMonth(month: string, delta: number) {
  const [year, currentMonth] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, currentMonth - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

export function getEffectiveStatus(
  payment: PaymentRecord,
  currentDateKey = new Date().toISOString().slice(0, 10),
): PaymentStatus {
  if (payment.status === "pending" && payment.due_date < currentDateKey) {
    return "overdue";
  }

  return payment.status;
}

export async function getPaymentsSnapshot(
  locale = "pt-BR",
  selectedMonth?: string,
  status: PaymentFilter = "all",
) {
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const activeMonth = selectedMonth || getCurrentMonthInTimeZone(partner.timezone);
  const currentDateKey = getTodayInTimeZone(partner.timezone);
  const supabase = await createSupabaseServerClient();
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(
      "id, student_id, class_id, amount_cents, currency, status, method, due_date, paid_at, reference_month, notes, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .eq("reference_month", toReferenceMonth(activeMonth))
    .order("due_date", { ascending: true });

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const studentIds = Array.from(
    new Set((payments ?? []).flatMap((payment) => (payment.student_id ? [payment.student_id] : []))),
  );
  const studentNameById = new Map<string, string>();

  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("partner_id", partner.partnerId)
      .in("id", studentIds);

    if (studentsError) {
      throw new Error(studentsError.message);
    }

    for (const student of students ?? []) {
      studentNameById.set(student.id, student.full_name);
    }
  }

  const normalizedPayments = ((payments ?? []) as PaymentRecord[])
    .map((payment) => ({
      ...payment,
      effective_status: getEffectiveStatus(payment, currentDateKey),
      student_name: studentNameById.get(payment.student_id) ?? null,
    }))
    .filter((payment) => (status === "all" ? true : payment.effective_status === status));

  const totals = normalizedPayments.reduce(
    (accumulator, payment) => {
      accumulator.all += 1;
      accumulator.amountAll += payment.amount_cents;
      accumulator[payment.effective_status ?? payment.status] += 1;
      if ((payment.effective_status ?? payment.status) === "pending") {
        accumulator.amountPending += payment.amount_cents;
      }
      if ((payment.effective_status ?? payment.status) === "paid") {
        accumulator.amountPaid += payment.amount_cents;
      }
      if ((payment.effective_status ?? payment.status) === "overdue") {
        accumulator.amountOverdue += payment.amount_cents;
      }
      return accumulator;
    },
    {
      all: 0,
      amountAll: 0,
      amountOverdue: 0,
      amountPaid: 0,
      amountPending: 0,
      cancelled: 0,
      overdue: 0,
      paid: 0,
      pending: 0,
    } satisfies Record<PaymentFilter, number> & {
      amountAll: number;
      amountOverdue: number;
      amountPaid: number;
      amountPending: number;
    },
  );

  return {
    month: activeMonth,
    nextMonth: shiftMonth(activeMonth, 1),
    payments: normalizedPayments,
    previousMonth: shiftMonth(activeMonth, -1),
    referenceMonth: toReferenceMonth(activeMonth),
    status,
    totals,
  };
}
