"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { buildAgendaUrl } from "@/features/classes/agenda";
import { getManualClassValidationMessage } from "@/features/classes/errors";
import { canRecordAttendance, mapAttendanceToClassStatus } from "@/features/classes/rules";
import { requireBillingAccess } from "@/features/subscriptions/data";
import { manualClassFormSchema } from "@/features/classes/validators";
import { getPartnerContext } from "@/lib/auth/partner";
import { zonedLocalDateTimeToUtc } from "@/lib/datetime/timezone";
import { createRequestId, logServerError, logServerEvent } from "@/lib/observability/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttendanceStatus, ClassStatus } from "@/types/schedule";
import type { AgendaView } from "@/features/classes/agenda";

export type ManualClassActionState = {
  error?: string;
};

async function getManualClassMessages(locale: string) {
  const t = await getTranslations({ locale, namespace: "Agenda" });

  return {
    errorClassDate: t("errorClassDate"),
    errorCreate: t("errorCreate"),
    errorDuration: t("errorDuration"),
    errorStartTime: t("errorStartTime"),
    errorTimezone: t("errorTimezone"),
    errorTitle: t("errorTitle"),
    validationInvalid: t("validationInvalid"),
  };
}

function buildManualClassPayload(formData: FormData) {
  return manualClassFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    timezone: String(formData.get("timezone") ?? ""),
    student_id: String(formData.get("student_id") ?? ""),
    class_date: String(formData.get("class_date") ?? ""),
    starts_at_time: String(formData.get("starts_at_time") ?? ""),
    duration_minutes: Number(formData.get("duration_minutes") ?? 0),
    notes: String(formData.get("notes") ?? ""),
  });
}

export async function createManualClassAction(
  locale: string,
  _prevState: ManualClassActionState,
  formData: FormData,
): Promise<ManualClassActionState> {
  const requestId = createRequestId();
  const messages = await getManualClassMessages(locale);
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = buildManualClassPayload(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        issue: parsed.error.issues[0]?.message ?? null,
        locale,
      },
      event: "manual_class_validation_failed",
      level: "warn",
      requestId,
      scope: "classes.actions",
    });
    return {
      error: getManualClassValidationMessage(messages, parsed.error.issues[0]),
    };
  }

  const values = parsed.data;
  const startsAt = zonedLocalDateTimeToUtc(
    values.class_date,
    values.starts_at_time,
    values.timezone,
  );
  const endsAt = new Date(startsAt.getTime() + values.duration_minutes * 60 * 1000);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("classes").insert({
    ends_at: endsAt.toISOString(),
    notes: values.notes,
    partner_id: partner.partnerId,
    schedule_id: null,
    source: "manual",
    starts_at: startsAt.toISOString(),
    status: "scheduled",
    student_id: values.student_id,
    subject: values.subject,
    timezone: values.timezone,
    title: values.title,
  });

  if (error) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
      },
      error,
      event: "manual_class_insert_failed",
      requestId,
      scope: "classes.actions",
    });
    return {
      error: messages.errorCreate,
    };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
    },
    event: "manual_class_created",
    requestId,
    scope: "classes.actions",
  });

  revalidatePath(`/${locale}/agenda`);
  redirect(buildAgendaUrl(locale, values.class_date, "all", "day"));
}

export async function cancelClassAction(
  locale: string,
  classId: string,
  selectedDate: string,
  status: ClassStatus | "all",
  view: AgendaView,
) {
  const requestId = createRequestId();
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("classes")
    .update({
      cancelled_at: new Date().toISOString(),
      cancelled_reason: "Cancelled from agenda",
      status: "cancelled",
    })
    .eq("id", classId)
    .eq("partner_id", partner.partnerId);

  if (error) {
    logServerError({
      data: {
        classId,
        locale,
        partnerId: partner.partnerId,
        selectedDate,
        status,
        view,
      },
      error,
      event: "class_cancel_failed",
      requestId,
      scope: "classes.actions",
    });
    throw new Error(error.message);
  }

  logServerEvent({
    data: {
      classId,
      locale,
      partnerId: partner.partnerId,
      selectedDate,
      status,
      view,
    },
    event: "class_cancelled",
    requestId,
    scope: "classes.actions",
  });

  revalidatePath(`/${locale}/agenda`);
  redirect(buildAgendaUrl(locale, selectedDate, status, view));
}

export async function recordAttendanceAction(
  locale: string,
  classId: string,
  attendanceStatus: AttendanceStatus,
  selectedDate: string,
  status: ClassStatus | "all",
  view: AgendaView,
) {
  const requestId = createRequestId();
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: classRecord, error: classError } = await supabase
    .from("classes")
    .select("id, partner_id, student_id, status")
    .eq("id", classId)
    .eq("partner_id", partner.partnerId)
    .single();

  if (classError || !classRecord) {
    logServerError({
      data: {
        attendanceStatus,
        classId,
        locale,
        partnerId: partner.partnerId,
      },
      error: classError ?? new Error("Class not found."),
      event: "attendance_class_lookup_failed",
      requestId,
      scope: "classes.actions",
    });
    throw new Error(classError?.message ?? "Class not found.");
  }

  if (!canRecordAttendance(classRecord.status, classRecord.student_id)) {
    logServerEvent({
      data: {
        attendanceStatus,
        classId,
        classStatus: classRecord.status,
        locale,
        partnerId: partner.partnerId,
        studentId: classRecord.student_id,
      },
      event: "attendance_rejected",
      level: "warn",
      requestId,
      scope: "classes.actions",
    });
    throw new Error("Attendance requires a linked student.");
  }

  const recordedAt = new Date().toISOString();
  const { error: attendanceError } = await supabase.from("attendance").upsert(
    {
      class_id: classRecord.id,
      notes: null,
      partner_id: partner.partnerId,
      recorded_at: recordedAt,
      recorded_by: partner.userId,
      status: attendanceStatus,
      student_id: classRecord.student_id,
    },
    { onConflict: "class_id,student_id" },
  );

  if (attendanceError) {
    logServerError({
      data: {
        attendanceStatus,
        classId,
        locale,
        partnerId: partner.partnerId,
      },
      error: attendanceError,
      event: "attendance_upsert_failed",
      requestId,
      scope: "classes.actions",
    });
    throw new Error(attendanceError.message);
  }

  const { error: updateClassError } = await supabase
    .from("classes")
    .update({
      status: mapAttendanceToClassStatus(attendanceStatus),
    })
    .eq("id", classRecord.id)
    .eq("partner_id", partner.partnerId);

  if (updateClassError) {
    logServerError({
      data: {
        attendanceStatus,
        classId,
        locale,
        partnerId: partner.partnerId,
      },
      error: updateClassError,
      event: "attendance_class_status_update_failed",
      requestId,
      scope: "classes.actions",
    });
    throw new Error(updateClassError.message);
  }

  logServerEvent({
    data: {
      attendanceStatus,
      classId,
      locale,
      partnerId: partner.partnerId,
      selectedDate,
      status,
      view,
    },
    event: "attendance_recorded",
    requestId,
    scope: "classes.actions",
  });

  revalidatePath(`/${locale}/agenda`);
  redirect(buildAgendaUrl(locale, selectedDate, status, view));
}
