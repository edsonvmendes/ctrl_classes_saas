"use server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getScheduleValidationMessage } from "@/features/schedules/errors";
import { buildClassesFromSchedule } from "@/features/schedules/generation";
import { requireBillingAccess } from "@/features/subscriptions/data";
import { scheduleFormSchema, type ScheduleFormValues } from "@/features/schedules/validators";
import { getPartnerContext } from "@/lib/auth/partner";
import { createRequestId, logServerError, logServerEvent } from "@/lib/observability/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ScheduleActionState = {
  error?: string;
};

async function getScheduleMessages(locale: string) {
  const t = await getTranslations({ locale, namespace: "Schedules" });

  return {
    errorDuration: t("errorDuration"),
    errorEndDate: t("errorEndDate"),
    errorSave: t("errorSave"),
    errorStartDate: t("errorStartDate"),
    errorStartTime: t("errorStartTime"),
    errorTimezone: t("errorTimezone"),
    errorTitle: t("errorTitle"),
    errorWeekdays: t("errorWeekdays"),
    validationInvalid: t("validationInvalid"),
  };
}

function buildPayload(formData: FormData) {
  return scheduleFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    timezone: String(formData.get("timezone") ?? ""),
    student_id: String(formData.get("student_id") ?? ""),
    starts_at_time: String(formData.get("starts_at_time") ?? ""),
    duration_minutes: Number(formData.get("duration_minutes") ?? 0),
    by_weekday: formData.getAll("by_weekday").map((value) => Number(value)),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
    status: String(formData.get("status") ?? "active"),
    notes: String(formData.get("notes") ?? ""),
  });
}

async function syncFutureScheduleClasses({
  nowIso,
  partnerId,
  scheduleId,
  supabase,
  values,
}: {
  nowIso: string;
  partnerId: string;
  scheduleId: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  values: ScheduleFormValues;
}) {
  const { error: deleteError } = await supabase
    .from("classes")
    .delete()
    .eq("partner_id", partnerId)
    .eq("schedule_id", scheduleId)
    .eq("status", "scheduled")
    .gte("starts_at", nowIso);

  if (deleteError) {
    return deleteError.message;
  }

  const generatedClasses = buildClassesFromSchedule({
    partnerId,
    scheduleId,
    values,
  }).filter((classItem) => classItem.starts_at >= nowIso);

  if (generatedClasses.length === 0) {
    return null;
  }

  const { error: classesError } = await supabase.from("classes").insert(generatedClasses);

  if (classesError) {
    return classesError.message;
  }

  return null;
}

async function getOwnedSchedule(
  locale: string,
  scheduleId: string,
  partnerId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data: schedule, error } = await supabase
    .from("schedules")
    .select(
      "id, student_id, title, subject, timezone, starts_at_time, duration_minutes, by_weekday, start_date, end_date, status, notes",
    )
    .eq("id", scheduleId)
    .eq("partner_id", partnerId)
    .single();

  if (error || !schedule) {
    redirect(`/${locale}/schedules`);
  }

  return schedule as ScheduleFormValues & { id: string };
}

export async function createScheduleAction(
  locale: string,
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  const requestId = createRequestId();
  const messages = await getScheduleMessages(locale);
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = buildPayload(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        issue: parsed.error.issues[0]?.message ?? null,
        locale,
      },
      event: "schedule_create_validation_failed",
      level: "warn",
      requestId,
      scope: "schedules.actions",
    });
    return {
      error: getScheduleValidationMessage(messages, parsed.error.issues[0]),
    };
  }

  const values = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .insert({
      ...values,
      partner_id: partner.partnerId,
    })
    .select("id")
    .single();

  if (scheduleError || !schedule) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
      },
      error: scheduleError ?? new Error("Schedule insert returned no record."),
      event: "schedule_create_insert_failed",
      requestId,
      scope: "schedules.actions",
    });
    return {
      error: messages.errorSave,
    };
  }

  const syncError = await syncFutureScheduleClasses({
    nowIso: new Date().toISOString(),
    partnerId: partner.partnerId,
    scheduleId: schedule.id,
    supabase,
    values,
  });

  if (syncError) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
        scheduleId: schedule.id,
      },
      error: syncError,
      event: "schedule_create_sync_failed",
      requestId,
      scope: "schedules.actions",
    });
    return {
      error: messages.errorSave,
    };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
      scheduleId: schedule.id,
    },
    event: "schedule_created",
    requestId,
    scope: "schedules.actions",
  });

  redirect(`/${locale}/schedules`);
}

export async function updateScheduleAction(
  locale: string,
  scheduleId: string,
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  const requestId = createRequestId();
  const messages = await getScheduleMessages(locale);
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = buildPayload(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        issue: parsed.error.issues[0]?.message ?? null,
        locale,
        scheduleId,
      },
      event: "schedule_update_validation_failed",
      level: "warn",
      requestId,
      scope: "schedules.actions",
    });
    return {
      error: getScheduleValidationMessage(messages, parsed.error.issues[0]),
    };
  }

  const values = parsed.data;
  const supabase = await createSupabaseServerClient();
  await getOwnedSchedule(locale, scheduleId, partner.partnerId, supabase);

  const { error: updateError } = await supabase
    .from("schedules")
    .update(values)
    .eq("id", scheduleId)
    .eq("partner_id", partner.partnerId);

  if (updateError) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
        scheduleId,
      },
      error: updateError,
      event: "schedule_update_failed",
      requestId,
      scope: "schedules.actions",
    });
    return {
      error: messages.errorSave,
    };
  }

  const syncError = await syncFutureScheduleClasses({
    nowIso: new Date().toISOString(),
    partnerId: partner.partnerId,
    scheduleId,
    supabase,
    values,
  });

  if (syncError) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
        scheduleId,
      },
      error: syncError,
      event: "schedule_update_sync_failed",
      requestId,
      scope: "schedules.actions",
    });
    return {
      error: messages.errorSave,
    };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
      scheduleId,
    },
    event: "schedule_updated",
    requestId,
    scope: "schedules.actions",
  });

  redirect(`/${locale}/schedules`);
}

export async function updateScheduleStatusAction(
  locale: string,
  scheduleId: string,
  nextStatus: ScheduleFormValues["status"],
) {
  const requestId = createRequestId();
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const schedule = await getOwnedSchedule(locale, scheduleId, partner.partnerId, supabase);

  const { error: updateError } = await supabase
    .from("schedules")
    .update({ status: nextStatus })
    .eq("id", scheduleId)
    .eq("partner_id", partner.partnerId);

  if (updateError) {
    logServerError({
      data: {
        locale,
        nextStatus,
        partnerId: partner.partnerId,
        scheduleId,
      },
      error: updateError,
      event: "schedule_status_update_failed",
      requestId,
      scope: "schedules.actions",
    });
    throw new Error(updateError.message);
  }

  const syncError = await syncFutureScheduleClasses({
    nowIso: new Date().toISOString(),
    partnerId: partner.partnerId,
    scheduleId,
    supabase,
    values: {
      ...schedule,
      status: nextStatus,
    },
  });

  if (syncError) {
    logServerError({
      data: {
        locale,
        nextStatus,
        partnerId: partner.partnerId,
        scheduleId,
      },
      error: syncError,
      event: "schedule_status_sync_failed",
      requestId,
      scope: "schedules.actions",
    });
    throw new Error(syncError);
  }

  logServerEvent({
    data: {
      locale,
      nextStatus,
      partnerId: partner.partnerId,
      scheduleId,
    },
    event: "schedule_status_updated",
    requestId,
    scope: "schedules.actions",
  });

  redirect(`/${locale}/schedules`);
}
