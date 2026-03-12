export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "pix" | "cash" | "transfer" | "card" | "other";

export type PaymentRecord = {
  id: string;
  student_id: string;
  class_id: string | null;
  amount_cents: number;
  currency: "BRL" | "USD" | "EUR";
  status: PaymentStatus;
  method: PaymentMethod | null;
  due_date: string;
  paid_at: string | null;
  reference_month: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  effective_status?: PaymentStatus;
};
