import { cache } from "react";

import { redirect } from "next/navigation";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClassRecord, ScheduleListItem } from "@/types/schedule";
import type { StudentRecord } from "@/types/student";

export const getScheduleStudents = cache(async (locale = "pt-BR") => {
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, status")
    .eq("partner_id", partner.partnerId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((student) => student.status === "active") as Pick<
    StudentRecord,
    "id" | "full_name" | "status"
  >[];
});

export const getSchedulesOverview = cache(async (locale = "pt-BR") => {
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select(
      "id, student_id, title, subject, timezone, starts_at_time, duration_minutes, by_weekday, start_date, end_date, status, notes, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .order("created_at", { ascending: false });

  if (schedulesError) {
    throw new Error(schedulesError.message);
  }

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("partner_id", partner.partnerId);

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  const scheduleIds = (schedules ?? []).map((schedule) => schedule.id);
  const upcomingStartsAt = new Date().toISOString();
  const { data: upcomingClasses, error: upcomingClassesError } = await supabase
    .from("classes")
    .select("id, schedule_id, student_id, title, subject, starts_at, ends_at, timezone, status, source")
    .eq("partner_id", partner.partnerId)
    .gte("starts_at", upcomingStartsAt)
    .order("starts_at", { ascending: true })
    .limit(20);

  if (upcomingClassesError) {
    throw new Error(upcomingClassesError.message);
  }

  const { data: scheduleClassCounts, error: scheduleClassCountsError } = scheduleIds.length
    ? await supabase
        .from("classes")
        .select("schedule_id")
        .eq("partner_id", partner.partnerId)
        .gte("starts_at", upcomingStartsAt)
        .in("schedule_id", scheduleIds)
    : { data: [], error: null };

  if (scheduleClassCountsError) {
    throw new Error(scheduleClassCountsError.message);
  }

  const studentNameById = new Map((students ?? []).map((student) => [student.id, student.full_name]));
  const classCountByScheduleId = new Map<string, number>();

  for (const classRecord of scheduleClassCounts ?? []) {
    if (!classRecord.schedule_id) {
      continue;
    }

    classCountByScheduleId.set(
      classRecord.schedule_id,
      (classCountByScheduleId.get(classRecord.schedule_id) ?? 0) + 1,
    );
  }

  return {
    classes: (upcomingClasses ?? []) as ClassRecord[],
    schedules: ((schedules ?? []) as ScheduleListItem[]).map((schedule) => ({
      ...schedule,
      generated_classes_count: classCountByScheduleId.get(schedule.id) ?? 0,
      student_name: schedule.student_id ? studentNameById.get(schedule.student_id) ?? null : null,
    })),
  };
});

export const getScheduleDetail = cache(async (locale: string, scheduleId: string) => {
  await requireBillingAccess(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(
      "id, student_id, title, subject, timezone, starts_at_time, duration_minutes, by_weekday, start_date, end_date, status, notes, created_at, updated_at",
    )
    .eq("partner_id", partner.partnerId)
    .eq("id", scheduleId)
    .single();

  if (error || !data) {
    redirect(`/${locale}/schedules`);
  }

  return data as ScheduleListItem;
});
