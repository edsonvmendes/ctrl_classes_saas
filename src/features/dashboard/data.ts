import { cache } from "react";

import { redirect } from "next/navigation";

import { requireOnboardedPartner } from "@/features/partners/data";
import { getSubscriptionSnapshot, requireBillingAccess } from "@/features/subscriptions/data";
import { getPartnerContext } from "@/lib/auth/partner";
import {
  getCurrentMonthInTimeZone,
  getTodayInTimeZone,
  zonedLocalDateTimeToUtc,
} from "@/lib/datetime/timezone";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClassRecord } from "@/types/schedule";

function getRelativeMinutesLabel(minutes: number) {
  if (minutes <= 1) {
    return "1 min";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, "0")}`;
}

function shiftDate(date: string, deltaDays: number) {
  const next = new Date(`${date}T12:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + deltaDays);
  return next.toISOString().slice(0, 10);
}

function getWeekStart(date: string) {
  const current = new Date(`${date}T12:00:00.000Z`);
  const weekdayIndex = (current.getUTCDay() + 6) % 7;
  current.setUTCDate(current.getUTCDate() - weekdayIndex);
  return current.toISOString().slice(0, 10);
}

function shiftMonth(month: string, delta: number) {
  const [year, currentMonth] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, currentMonth - 1 + delta, 1));
  return shifted.toISOString().slice(0, 7);
}

type DashboardActivity = {
  amountCents?: number;
  currency?: string;
  href: string;
  id: string;
  key: "class" | "payment" | "schedule" | "student";
  occurredAt: string;
  status?: string | null;
  studentName?: string | null;
  title?: string | null;
};

type DashboardTimelineClass = ClassRecord & {
  updated_at?: string | null;
};

export const getDashboardSnapshot = cache(async (locale = "pt-BR") => {
  await requireBillingAccess(locale);
  const profile = await requireOnboardedPartner(locale);
  const subscriptionSnapshot = await getSubscriptionSnapshot(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const partnerId = partner.partnerId;
  const today = getTodayInTimeZone(profile.timezone);
  const nextDay = shiftDate(today, 1);
  const dayStart = zonedLocalDateTimeToUtc(today, "00:00:00", profile.timezone);
  const dayEnd = zonedLocalDateTimeToUtc(nextDay, "00:00:00", profile.timezone);
  const weekStart = getWeekStart(today);
  const weekEnd = shiftDate(weekStart, 7);
  const weekStartUtc = zonedLocalDateTimeToUtc(weekStart, "00:00:00", profile.timezone);
  const weekEndUtc = zonedLocalDateTimeToUtc(weekEnd, "00:00:00", profile.timezone);
  const currentMonth = getCurrentMonthInTimeZone(profile.timezone);
  const previousMonth = shiftMonth(currentMonth, -1);
  const nextMonth = shiftMonth(currentMonth, 1);
  const now = new Date();

  const [
    activeStudentsResult,
    activeSchedulesResult,
    todayClassesResult,
    pendingPaymentsResult,
    todayTimelineResult,
    paymentsResult,
    recentSchedulesResult,
    recentStudentsResult,
    studentsThisMonthResult,
    studentsPreviousMonthResult,
    weeklyClassesResult,
    weeklyPaymentsResult,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("status", "active"),
    supabase
      .from("schedules")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("status", "active"),
    supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .gte("starts_at", dayStart.toISOString())
      .lt("starts_at", dayEnd.toISOString()),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("reference_month", `${currentMonth}-01`)
      .eq("status", "pending"),
    supabase
      .from("classes")
      .select("id, schedule_id, student_id, title, subject, starts_at, ends_at, timezone, status, source, updated_at")
      .eq("partner_id", partnerId)
      .gte("starts_at", dayStart.toISOString())
      .lt("starts_at", dayEnd.toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("payments")
      .select("id, student_id, amount_cents, currency, status, paid_at, due_date, updated_at")
      .eq("partner_id", partnerId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("schedules")
      .select("id, student_id, title, status, updated_at")
      .eq("partner_id", partnerId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("students")
      .select("id, full_name, status, created_at, updated_at")
      .eq("partner_id", partnerId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .gte("created_at", `${currentMonth}-01T00:00:00.000Z`)
      .lt("created_at", `${nextMonth}-01T00:00:00.000Z`),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .gte("created_at", `${previousMonth}-01T00:00:00.000Z`)
      .lt("created_at", `${currentMonth}-01T00:00:00.000Z`),
    supabase
      .from("classes")
      .select("id, status, starts_at, ends_at")
      .eq("partner_id", partnerId)
      .gte("starts_at", weekStartUtc.toISOString())
      .lt("starts_at", weekEndUtc.toISOString()),
    supabase
      .from("payments")
      .select("id, amount_cents, currency, paid_at")
      .eq("partner_id", partnerId)
      .eq("status", "paid")
      .gte("paid_at", weekStartUtc.toISOString())
      .lt("paid_at", weekEndUtc.toISOString()),
  ]);

  for (const result of [
    activeStudentsResult,
    activeSchedulesResult,
    todayClassesResult,
    pendingPaymentsResult,
    todayTimelineResult,
    paymentsResult,
    recentSchedulesResult,
    recentStudentsResult,
    studentsThisMonthResult,
    studentsPreviousMonthResult,
    weeklyClassesResult,
    weeklyPaymentsResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const todayTimeline = (todayTimelineResult.data ?? []) as DashboardTimelineClass[];
  const timelineStudentIds = Array.from(
    new Set(
      [
        ...todayTimeline.flatMap((classItem) => (classItem.student_id ? [classItem.student_id] : [])),
        ...(paymentsResult.data ?? []).flatMap((payment) => (payment.student_id ? [payment.student_id] : [])),
        ...(recentSchedulesResult.data ?? []).flatMap((schedule) => (schedule.student_id ? [schedule.student_id] : [])),
      ],
    ),
  );
  const studentsById = new Map<string, string>();

  if (timelineStudentIds.length > 0) {
    const { data: timelineStudents, error: timelineStudentsError } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("partner_id", partnerId)
      .in("id", timelineStudentIds);

    if (timelineStudentsError) {
      throw new Error(timelineStudentsError.message);
    }

    for (const student of timelineStudents ?? []) {
      studentsById.set(student.id, student.full_name);
    }
  }

  const normalizedTodayTimeline = todayTimeline.map((classItem) => {
    const startsAt = new Date(classItem.starts_at);
    const endsAt = new Date(classItem.ends_at);
    const minutesUntilStart = Math.ceil((startsAt.getTime() - now.getTime()) / 60000);
    const isNow = now >= startsAt && now <= endsAt && classItem.status === "scheduled";
    const isNext =
      !isNow &&
      minutesUntilStart > 0 &&
      classItem.status === "scheduled" &&
      !todayTimeline.some((item) => {
        if (item.id === classItem.id || item.status !== "scheduled") {
          return false;
        }

        const itemStartsAt = new Date(item.starts_at);
        const itemMinutesUntilStart = Math.ceil((itemStartsAt.getTime() - now.getTime()) / 60000);
        return itemMinutesUntilStart > 0 && itemMinutesUntilStart < minutesUntilStart;
      });

    return {
      ...classItem,
      durationMinutes: Math.max(15, Math.round((endsAt.getTime() - startsAt.getTime()) / 60000)),
      isNext,
      isNow,
      minutesUntilStart,
      relativeStartLabel:
        minutesUntilStart > 0 ? getRelativeMinutesLabel(minutesUntilStart) : null,
      student_name: classItem.student_id ? studentsById.get(classItem.student_id) ?? null : null,
    };
  });

  const weeklyClasses = weeklyClassesResult.data ?? [];
  const completedThisWeek = weeklyClasses.filter((classItem) => classItem.status === "completed").length;
  const noShowThisWeek = weeklyClasses.filter((classItem) => classItem.status === "no_show").length;
  const attendedClasses = completedThisWeek;
  const attendanceBase = attendedClasses + noShowThisWeek;
  const attendanceRate = attendanceBase === 0 ? 100 : Math.round((attendedClasses / attendanceBase) * 100);
  const weeklyRevenueCents = (weeklyPaymentsResult.data ?? []).reduce(
    (total, payment) => total + payment.amount_cents,
    0,
  );

  const onboardingSteps = [
    {
      completed: Boolean(profile.display_name && profile.locale && profile.currency && profile.timezone),
      href: `/${locale}/onboarding`,
      key: "profile",
    },
    {
      completed: (activeStudentsResult.count ?? 0) > 0,
      href: `/${locale}/students/new`,
      key: "students",
    },
    {
      completed: (activeSchedulesResult.count ?? 0) > 0,
      href: `/${locale}/schedules/new`,
      key: "schedules",
    },
    {
      completed: subscriptionSnapshot.stripeConfigured,
      href: `/${locale}/settings`,
      key: "payments",
    },
  ] as const;

  const recentActivity: DashboardActivity[] = [
    ...((paymentsResult.data ?? []).map((payment) => ({
      amountCents: payment.amount_cents,
      currency: payment.currency,
      href: `/${locale}/payments`,
      id: payment.id,
      key: "payment" as const,
      occurredAt: payment.paid_at ?? payment.updated_at,
      status: payment.status,
      studentName: payment.student_id ? studentsById.get(payment.student_id) ?? null : null,
    })) ?? []),
    ...((recentSchedulesResult.data ?? []).map((schedule) => ({
      href: `/${locale}/schedules`,
      id: schedule.id,
      key: "schedule" as const,
      occurredAt: schedule.updated_at,
      status: schedule.status,
      studentName: schedule.student_id ? studentsById.get(schedule.student_id) ?? null : null,
      title: schedule.title,
    })) ?? []),
    ...((recentStudentsResult.data ?? []).map((student) => ({
      href: `/${locale}/students`,
      id: student.id,
      key: "student" as const,
      occurredAt: student.updated_at ?? student.created_at,
      status: student.status,
      studentName: student.full_name,
    })) ?? []),
    ...normalizedTodayTimeline.map((classItem) => ({
      href: `/${locale}/agenda?view=day&date=${today}`,
      id: classItem.id,
      key: "class" as const,
      occurredAt: classItem.updated_at ?? classItem.starts_at,
      status: classItem.status,
      studentName: classItem.student_name ?? null,
      title: classItem.title,
    })),
  ]
    .sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime())
    .slice(0, 5);

  return {
    comparisons: {
      studentsDeltaThisMonth:
        (studentsThisMonthResult.count ?? 0) - (studentsPreviousMonthResult.count ?? 0),
    },
    currentMoment: {
      nextLabel:
        normalizedTodayTimeline.find((classItem) => classItem.isNow || classItem.isNext)?.relativeStartLabel ?? null,
      todayTimelineCount: normalizedTodayTimeline.length,
    },
    onboarding: {
      completed: onboardingSteps.filter((step) => step.completed).length,
      steps: onboardingSteps,
      total: onboardingSteps.length,
    },
    partner: profile,
    recentActivity,
    stripeConfigured: subscriptionSnapshot.stripeConfigured,
    subscription: subscriptionSnapshot.subscription,
    today,
    todayTimeline: normalizedTodayTimeline,
    weeklySummary: {
      attendanceRate,
      completedClasses: completedThisWeek,
      noShowClasses: noShowThisWeek,
      revenueCents: weeklyRevenueCents,
      totalClasses: weeklyClasses.length,
    },
    stats: {
      activeSchedules: activeSchedulesResult.count ?? 0,
      activeStudents: activeStudentsResult.count ?? 0,
      pendingPayments: pendingPaymentsResult.count ?? 0,
      todayClasses: todayClassesResult.count ?? 0,
    },
  };
});
