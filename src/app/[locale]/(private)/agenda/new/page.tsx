import { setRequestLocale } from "next-intl/server";

import { createManualClassAction } from "@/features/classes/actions";
import { ManualClassForm } from "@/features/classes/manual-class-form";
import { requireBillingAccess } from "@/features/subscriptions/data";
import { getScheduleStudents } from "@/features/schedules/data";
import { getPartnerContext } from "@/lib/auth/partner";
import { getTodayInTimeZone } from "@/lib/datetime/timezone";

type NewManualClassPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewManualClassPage({ params }: NewManualClassPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBillingAccess(locale);

  const partner = await getPartnerContext();
  const students = await getScheduleStudents(locale);
  const action = createManualClassAction.bind(null, locale);
  const timezone = partner?.timezone ?? "America/Sao_Paulo";

  return (
    <ManualClassForm
      action={action}
      cancelHref={`/${locale}/agenda`}
      defaultDate={getTodayInTimeZone(timezone)}
      defaultTimezone={timezone}
      students={students.map((student) => ({
        id: student.id,
        full_name: student.full_name,
      }))}
    />
  );
}
