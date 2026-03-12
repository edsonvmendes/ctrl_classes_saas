import { setRequestLocale } from "next-intl/server";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { createScheduleAction } from "@/features/schedules/actions";
import { getScheduleStudents } from "@/features/schedules/data";
import { ScheduleForm } from "@/features/schedules/schedule-form";
import { getPartnerContext } from "@/lib/auth/partner";

type NewSchedulePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewSchedulePage({ params }: NewSchedulePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBillingAccess(locale);

  const partner = await getPartnerContext();
  const students = await getScheduleStudents(locale);
  const action = createScheduleAction.bind(null, locale);

  return (
    <ScheduleForm
      action={action}
      cancelHref={`/${locale}/schedules`}
      defaultTimezone={partner?.timezone ?? "America/Sao_Paulo"}
      students={students.map((student) => ({
        id: student.id,
        full_name: student.full_name,
      }))}
    />
  );
}
