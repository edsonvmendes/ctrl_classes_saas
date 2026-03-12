"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { createRequestId, logServerError, logServerEvent } from "@/lib/observability/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { studentFormSchema } from "@/features/students/validators";

export type StudentActionState = {
  error?: string;
  success?: string;
};

async function getStudentMessages(locale: string) {
  const t = await getTranslations({ locale, namespace: "Students" });

  return {
    errorBillingDay: t("errorBillingDay"),
    errorClassRate: t("errorClassRate"),
    errorEmail: t("errorEmail"),
    errorFullName: t("errorFullName"),
    errorMonthlyAmount: t("errorMonthlyAmount"),
    errorSave: t("errorSave"),
    validationInvalid: t("validationInvalid"),
  };
}

function getStudentValidationMessage(
  messages: Awaited<ReturnType<typeof getStudentMessages>>,
  field?: string,
) {
  switch (field) {
    case "full_name":
      return messages.errorFullName;
    case "email":
      return messages.errorEmail;
    case "monthly_amount":
      return messages.errorMonthlyAmount;
    case "billing_day_of_month":
      return messages.errorBillingDay;
    case "class_rate":
      return messages.errorClassRate;
    default:
      return messages.validationInvalid;
  }
}

function buildPayload(formData: FormData) {
  return studentFormSchema.safeParse({
    billing_day_of_month: String(formData.get("billing_day_of_month") ?? ""),
    billing_type: String(formData.get("billing_type") ?? "monthly"),
    charge_no_show: formData.get("charge_no_show") === "on" ? "true" : "false",
    class_rate: String(formData.get("class_rate") ?? ""),
    currency: String(formData.get("currency") ?? "BRL"),
    email: String(formData.get("email") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    monthly_amount: String(formData.get("monthly_amount") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    status: String(formData.get("status") ?? "active"),
  });
}

export async function createStudentAction(
  locale: string,
  _prevState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const requestId = createRequestId();
  const messages = await getStudentMessages(locale);
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = buildPayload(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        field: String(parsed.error.issues[0]?.path[0] ?? ""),
        locale,
      },
      event: "student_create_validation_failed",
      level: "warn",
      requestId,
      scope: "students.actions",
    });
    return { error: getStudentValidationMessage(messages, String(parsed.error.issues[0]?.path[0] ?? "")) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("students").insert({
    ...parsed.data,
    partner_id: partner.partnerId,
  });

  if (error) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
      },
      error,
      event: "student_create_insert_failed",
      requestId,
      scope: "students.actions",
    });
    return { error: messages.errorSave };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
    },
    event: "student_created",
    requestId,
    scope: "students.actions",
  });

  redirect(`/${locale}/students`);
}

export async function updateStudentAction(
  locale: string,
  studentId: string,
  _prevState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const requestId = createRequestId();
  const messages = await getStudentMessages(locale);
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = buildPayload(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        field: String(parsed.error.issues[0]?.path[0] ?? ""),
        locale,
        studentId,
      },
      event: "student_update_validation_failed",
      level: "warn",
      requestId,
      scope: "students.actions",
    });
    return { error: getStudentValidationMessage(messages, String(parsed.error.issues[0]?.path[0] ?? "")) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("students")
    .update(parsed.data)
    .eq("id", studentId);

  if (error) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
        studentId,
      },
      error,
      event: "student_update_failed",
      requestId,
      scope: "students.actions",
    });
    return { error: messages.errorSave };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
      studentId,
    },
    event: "student_updated",
    requestId,
    scope: "students.actions",
  });

  redirect(`/${locale}/students`);
}
