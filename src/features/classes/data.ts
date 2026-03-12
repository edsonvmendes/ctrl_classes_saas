import { cache } from "react";

import { redirect } from "next/navigation";

import { getViewRange } from "@/features/classes/agenda";
import { requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import {
  getLocalDateKey,
  getTodayInTimeZone,
  shiftIsoDate,
  zonedLocalDateTimeToUtc,
} from "@/lib/datetime/timezone";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AttendanceStatus, ClassRecord, ClassStatus } from "@/types/schedule";
import type { AgendaView } from "@/features/classes/agenda";

export type AgendaFilter = ClassStatus | "all";

type AgendaDayBucket = {
  classes: ClassRecord[];
  date: string;
  inCurrentPeriod: boolean;
};

export const getAgendaSnapshot = cache(
  async (
    locale = "pt-BR",
    selectedDate?: string,
    status: AgendaFilter = "all",
    view: AgendaView = "day",
  ) => {
    await requireBillingAccess(locale);
    const partner = await getPartnerContext();

    if (!partner) {
      redirect(`/${locale}/login`);
    }

    const activeDate = selectedDate || getTodayInTimeZone(partner.timezone);
    const range = getViewRange(view, activeDate);
    const rangeStart = zonedLocalDateTimeToUtc(range.gridStart, "00:00:00", partner.timezone);
    const rangeEnd = zonedLocalDateTimeToUtc(
      range.periodEndExclusive,
      "00:00:00",
      partner.timezone,
    );

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("classes")
      .select(
        "id, schedule_id, student_id, title, subject, starts_at, ends_at, timezone, status, source, notes, cancelled_at, cancelled_reason",
      )
      .eq("partner_id", partner.partnerId)
      .gte("starts_at", rangeStart.toISOString())
      .lt("starts_at", rangeEnd.toISOString())
      .order("starts_at", { ascending: true });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: classes, error: classesError } = await query;

    if (classesError) {
      throw new Error(classesError.message);
    }

    const classIds = Array.from(new Set((classes ?? []).map((classItem) => classItem.id)));
    const studentIds = Array.from(
      new Set(
        (classes ?? []).flatMap((classItem) => (classItem.student_id ? [classItem.student_id] : [])),
      ),
    );

    const studentsById = new Map<string, string>();
    const attendanceByClassId = new Map<
      string,
      {
        notes: string | null;
        recorded_at: string;
        status: AttendanceStatus;
      }
    >();

    if (studentIds.length > 0) {
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("partner_id", partner.partnerId)
        .in("id", studentIds);

      if (studentsError) {
        throw new Error(studentsError.message);
      }

      for (const student of students ?? []) {
        studentsById.set(student.id, student.full_name);
      }
    }

    if (classIds.length > 0) {
      const { data: attendanceRows, error: attendanceError } = await supabase
        .from("attendance")
        .select("class_id, status, recorded_at, notes")
        .eq("partner_id", partner.partnerId)
        .in("class_id", classIds);

      if (attendanceError) {
        throw new Error(attendanceError.message);
      }

      for (const attendanceRow of attendanceRows ?? []) {
        attendanceByClassId.set(attendanceRow.class_id, attendanceRow);
      }
    }

    const normalizedClasses = ((classes ?? []) as ClassRecord[]).map((classItem) => ({
      ...classItem,
      attendance_notes: attendanceByClassId.get(classItem.id)?.notes ?? null,
      attendance_recorded_at: attendanceByClassId.get(classItem.id)?.recorded_at ?? null,
      attendance_status: attendanceByClassId.get(classItem.id)?.status ?? null,
      student_name: classItem.student_id ? studentsById.get(classItem.student_id) ?? null : null,
    }));

    const classesByDate = new Map<string, ClassRecord[]>();

    for (const classItem of normalizedClasses) {
      const localDate = getLocalDateKey(new Date(classItem.starts_at), partner.timezone);
      const bucket = classesByDate.get(localDate) ?? [];
      bucket.push(classItem);
      classesByDate.set(localDate, bucket);
    }

    const days: AgendaDayBucket[] = [];

    for (let index = 0; index < range.gridTotalDays; index += 1) {
      const day = shiftIsoDate(range.gridStart, index);

      days.push({
        classes: classesByDate.get(day) ?? [],
        date: day,
        inCurrentPeriod:
          view === "month" ? day.slice(0, 7) === range.periodStart.slice(0, 7) : true,
      });
    }

    return {
      days,
      nextDate: range.nextDate,
      previousDate: range.previousDate,
      selectedDate: activeDate,
      selectedPeriodStart: range.periodStart,
      status,
      timezone: partner.timezone,
      view,
    };
  },
);
