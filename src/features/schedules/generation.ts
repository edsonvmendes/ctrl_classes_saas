import { zonedLocalDateTimeToUtc } from "@/lib/datetime/timezone";
import type { ScheduleFormValues } from "@/features/schedules/validators";

const GENERATION_WINDOW_DAYS = 84;

type GenerateClassesInput = {
  partnerId: string;
  scheduleId: string;
  values: ScheduleFormValues;
};

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildClassesFromSchedule({
  partnerId,
  scheduleId,
  values,
}: GenerateClassesInput) {
  if (values.status !== "active") {
    return [];
  }

  const startDate = parseDate(values.start_date);
  const requestedEndDate = values.end_date ? parseDate(values.end_date) : null;
  const maxHorizon = addDays(startDate, GENERATION_WINDOW_DAYS);
  const endDate =
    requestedEndDate && requestedEndDate.getTime() < maxHorizon.getTime()
      ? requestedEndDate
      : maxHorizon;

  const generated = [];

  for (
    let cursor = new Date(startDate);
    cursor.getTime() <= endDate.getTime();
    cursor = addDays(cursor, 1)
  ) {
    if (!values.by_weekday.includes(cursor.getUTCDay())) {
      continue;
    }

    const classDate = toIsoDate(cursor);
    const startsAt = zonedLocalDateTimeToUtc(
      classDate,
      values.starts_at_time,
      values.timezone,
    );
    const endsAt = new Date(startsAt.getTime() + values.duration_minutes * 60 * 1000);

    generated.push({
      partner_id: partnerId,
      schedule_id: scheduleId,
      student_id: values.student_id,
      source: "schedule",
      title: values.title,
      subject: values.subject,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      timezone: values.timezone,
      status: "scheduled",
      notes: values.notes,
    });
  }

  return generated;
}
