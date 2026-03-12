export type StudentStatus = "active" | "inactive" | "archived";
export type StudentBillingType = "monthly" | "per_class";
export type StudentCurrency = "BRL" | "USD" | "EUR";

export type StudentRecord = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: StudentStatus;
  billing_type: StudentBillingType;
  monthly_amount_cents: number | null;
  class_rate_cents: number | null;
  billing_day_of_month: number | null;
  charge_no_show: boolean;
  currency: StudentCurrency;
  created_at: string;
  updated_at: string;
};
