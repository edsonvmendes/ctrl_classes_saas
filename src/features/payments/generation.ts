import { getLocalDateKey } from "@/lib/datetime/timezone";
import type { PaymentStatus } from "@/types/payment";

export type MonthlyBillingStudent = {
  billing_day_of_month: number;
  currency: "BRL" | "USD" | "EUR";
  id: string;
  monthly_amount_cents: number;
};

export type PerClassBillingStudent = {
  charge_no_show: boolean;
  class_rate_cents: number;
  currency: "BRL" | "USD" | "EUR";
  id: string;
};

export type BillableClass = {
  id: string;
  starts_at: string;
  status: "completed" | "no_show";
  student_id: string | null;
};

type GeneratedPaymentPayload = {
  amount_cents: number;
  class_id: string | null;
  currency: string;
  due_date: string;
  notes: string;
  partner_id: string;
  reference_month: string;
  status: PaymentStatus;
  student_id: string;
};

export function toReferenceMonth(month: string) {
  return `${month}-01`;
}

export function shiftMonth(month: string, delta: number) {
  const [year, currentMonth] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, currentMonth - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

function toDueDate(month: string, billingDay: number) {
  return `${month}-${String(billingDay).padStart(2, "0")}`;
}

export function buildMonthlyPaymentPayload({
  existingMonthlyStudentIds,
  month,
  partnerId,
  referenceMonth,
  students,
}: {
  existingMonthlyStudentIds: Set<string>;
  month: string;
  partnerId: string;
  referenceMonth: string;
  students: MonthlyBillingStudent[];
}): GeneratedPaymentPayload[] {
  return students
    .filter((student) => !existingMonthlyStudentIds.has(student.id))
    .map((student) => ({
      amount_cents: student.monthly_amount_cents,
      class_id: null,
      currency: student.currency,
      due_date: toDueDate(month, student.billing_day_of_month),
      notes: `Monthly fixed charge for ${month}`,
      partner_id: partnerId,
      reference_month: referenceMonth,
      status: "pending" satisfies PaymentStatus,
      student_id: student.id,
    }));
}

export function buildPerClassPaymentPayload({
  classes,
  existingClassIds,
  partnerId,
  partnerTimezone,
  referenceMonth,
  students,
}: {
  classes: BillableClass[];
  existingClassIds: Set<string>;
  partnerId: string;
  partnerTimezone: string;
  referenceMonth: string;
  students: PerClassBillingStudent[];
}): GeneratedPaymentPayload[] {
  const perClassStudentById = new Map(students.map((student) => [student.id, student]));

  return classes
    .filter((classItem) => !existingClassIds.has(classItem.id))
    .flatMap((classItem) => {
      if (!classItem.student_id) {
        return [];
      }

      const student = perClassStudentById.get(classItem.student_id);

      if (!student) {
        return [];
      }

      if (classItem.status === "no_show" && !student.charge_no_show) {
        return [];
      }

      const classDate = getLocalDateKey(new Date(classItem.starts_at), partnerTimezone);

      return [
        {
          amount_cents: student.class_rate_cents,
          class_id: classItem.id,
          currency: student.currency,
          due_date: classDate,
          notes:
            classItem.status === "no_show"
              ? `No-show charge for ${classDate}`
              : `Class charge for ${classDate}`,
          partner_id: partnerId,
          reference_month: referenceMonth,
          status: "pending" satisfies PaymentStatus,
          student_id: classItem.student_id,
        },
      ];
    });
}
