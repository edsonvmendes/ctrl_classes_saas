import { setRequestLocale } from "next-intl/server";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { updateScheduleAction } from "@/features/schedules/actions";
import { getScheduleDetail, getScheduleStudents } from "@/features/schedules/data";
import { ScheduleForm } from "@/features/schedules/schedule-form";
import { getPartnerContext } from "@/lib/auth/partner";

type EditSchedulePageProps = {
  params: Promise<{ locale: string; scheduleId: string }>;
};

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  const { locale, scheduleId } = await params;
  setRequestLocale(locale);
  await requireBillingAccess(locale);

  const partner = await getPartnerContext();
  const students = await getScheduleStudents(locale);
  const schedule = await getScheduleDetail(locale, scheduleId);
  const action = updateScheduleAction.bind(null, locale, scheduleId);

  return (
    <ScheduleForm
      action={action}
      cancelHref={`/${locale}/schedules`}
      defaultTimezone={partner?.timezone ?? "America/Sao_Paulo"}
      initialValues={{
        by_weekday: schedule.by_weekday,
        duration_minutes: schedule.duration_minutes,
        end_date: schedule.end_date,
        notes: schedule.notes,
        start_date: schedule.start_date,
        starts_at_time: schedule.starts_at_time,
        status: schedule.status,
        student_id: schedule.student_id,
        subject: schedule.subject,
        timezone: schedule.timezone,
        title: schedule.title,
      }}
      mode="edit"
      students={students.map((student) => ({
        id: student.id,
        full_name: student.full_name,
      }))}
    />
  );
}
