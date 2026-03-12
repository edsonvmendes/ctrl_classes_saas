import { z } from "zod";

const optionalText = z.string().trim().transform((value) => value || null);
const optionalEmail = z
  .string()
  .trim()
  .transform((value) => value || null)
  .refine((value) => value === null || z.email().safeParse(value).success, {
    message: "Please provide a valid email address.",
  });

function currencyStringToCents(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return Number.NaN;
  }

  return Math.round(amount * 100);
}

export const studentFormSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name must have at least 2 characters."),
    email: optionalEmail,
    phone: optionalText,
    notes: optionalText,
    status: z.enum(["active", "inactive", "archived"]),
    billing_type: z.enum(["monthly", "per_class"]),
    monthly_amount: z.string().trim().default(""),
    class_rate: z.string().trim().default(""),
    billing_day_of_month: z.string().trim().default(""),
    charge_no_show: z.enum(["true", "false"]).transform((value) => value === "true"),
    currency: z.enum(["BRL", "USD", "EUR"]),
  })
  .transform((values, ctx) => {
    const monthlyAmountCents = currencyStringToCents(values.monthly_amount);
    const classRateCents = currencyStringToCents(values.class_rate);
    const billingDay =
      values.billing_day_of_month === "" ? null : Number(values.billing_day_of_month);

    if (values.billing_type === "monthly") {
      if (!monthlyAmountCents || Number.isNaN(monthlyAmountCents)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Monthly billing requires a valid monthly amount.",
          path: ["monthly_amount"],
        });
      }

      if (!billingDay || Number.isNaN(billingDay) || billingDay < 1 || billingDay > 28) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Monthly billing requires a billing day between 1 and 28.",
          path: ["billing_day_of_month"],
        });
      }
    }

    if (values.billing_type === "per_class" && (!classRateCents || Number.isNaN(classRateCents))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Per-class billing requires a valid class rate.",
        path: ["class_rate"],
      });
    }

    return {
      billing_day_of_month: billingDay,
      billing_type: values.billing_type,
      charge_no_show: values.charge_no_show,
      class_rate_cents:
        values.billing_type === "per_class" && classRateCents && !Number.isNaN(classRateCents)
          ? classRateCents
          : null,
      currency: values.currency,
      email: values.email,
      full_name: values.full_name,
      monthly_amount_cents:
        values.billing_type === "monthly" && monthlyAmountCents && !Number.isNaN(monthlyAmountCents)
          ? monthlyAmountCents
          : null,
      notes: values.notes,
      phone: values.phone,
      status: values.status,
    };
  });

export type StudentFormValues = z.infer<typeof studentFormSchema>;
