import { describe, expect, it } from "vitest";

import {
  buildMonthlyPaymentPayload,
  buildPerClassPaymentPayload,
  shiftMonth,
  toReferenceMonth,
} from "@/features/payments/generation";

describe("payments generation", () => {
  it("builds monthly payments only for students without existing monthly charge", () => {
    const result = buildMonthlyPaymentPayload({
      existingMonthlyStudentIds: new Set(["student-2"]),
      month: "2026-03",
      partnerId: "partner-1",
      referenceMonth: toReferenceMonth("2026-03"),
      students: [
        {
          billing_day_of_month: 5,
          currency: "BRL",
          id: "student-1",
          monthly_amount_cents: 12000,
        },
        {
          billing_day_of_month: 10,
          currency: "USD",
          id: "student-2",
          monthly_amount_cents: 15000,
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      amount_cents: 12000,
      class_id: null,
      due_date: "2026-03-05",
      partner_id: "partner-1",
      student_id: "student-1",
    });
  });

  it("builds per-class charges and skips no-show when student should not be charged", () => {
    const result = buildPerClassPaymentPayload({
      classes: [
        {
          id: "class-1",
          starts_at: "2026-03-10T13:00:00.000Z",
          status: "completed",
          student_id: "student-1",
        },
        {
          id: "class-2",
          starts_at: "2026-03-11T13:00:00.000Z",
          status: "no_show",
          student_id: "student-1",
        },
        {
          id: "class-3",
          starts_at: "2026-03-12T13:00:00.000Z",
          status: "no_show",
          student_id: "student-2",
        },
      ],
      existingClassIds: new Set(["class-1"]),
      partnerId: "partner-1",
      partnerTimezone: "America/Sao_Paulo",
      referenceMonth: "2026-03-01",
      students: [
        {
          charge_no_show: false,
          class_rate_cents: 9000,
          currency: "BRL",
          id: "student-1",
        },
        {
          charge_no_show: true,
          class_rate_cents: 11000,
          currency: "USD",
          id: "student-2",
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      amount_cents: 11000,
      class_id: "class-3",
      due_date: "2026-03-12",
      student_id: "student-2",
    });
    expect(result[0]?.notes).toContain("No-show charge");
  });

  it("shifts months predictably", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });
});
