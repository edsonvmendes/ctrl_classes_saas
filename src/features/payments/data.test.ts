import { describe, expect, it } from "vitest";

import { getEffectiveStatus } from "@/features/payments/data";
import type { PaymentRecord } from "@/types/payment";

describe("payments data helpers", () => {
  it("marks pending payments as overdue after the due date", () => {
    const payment = {
      amount_cents: 25000,
      class_id: null,
      created_at: "2026-03-01T00:00:00.000Z",
      currency: "BRL",
      due_date: "2026-03-10",
      id: "payment-1",
      method: null,
      notes: null,
      paid_at: null,
      reference_month: "2026-03-01",
      status: "pending",
      student_id: "student-1",
      updated_at: "2026-03-01T00:00:00.000Z",
    } satisfies PaymentRecord;

    expect(getEffectiveStatus(payment, "2026-03-15")).toBe("overdue");
  });

  it("keeps paid payments unchanged even after the due date", () => {
    const payment = {
      amount_cents: 25000,
      class_id: null,
      created_at: "2026-03-01T00:00:00.000Z",
      currency: "BRL",
      due_date: "2026-03-10",
      id: "payment-2",
      method: "pix",
      notes: null,
      paid_at: "2026-03-09T12:00:00.000Z",
      reference_month: "2026-03-01",
      status: "paid",
      student_id: "student-1",
      updated_at: "2026-03-09T12:00:00.000Z",
    } satisfies PaymentRecord;

    expect(getEffectiveStatus(payment, "2026-03-15")).toBe("paid");
  });

  it("keeps a pending payment as pending until the partner local date passes", () => {
    const payment = {
      amount_cents: 25000,
      class_id: null,
      created_at: "2026-03-01T00:00:00.000Z",
      currency: "BRL",
      due_date: "2026-03-10",
      id: "payment-3",
      method: null,
      notes: null,
      paid_at: null,
      reference_month: "2026-03-01",
      status: "pending",
      student_id: "student-1",
      updated_at: "2026-03-01T00:00:00.000Z",
    } satisfies PaymentRecord;

    expect(getEffectiveStatus(payment, "2026-03-10")).toBe("pending");
  });
});
