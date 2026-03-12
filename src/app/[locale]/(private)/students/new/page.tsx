import { setRequestLocale } from "next-intl/server";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { createStudentAction } from "@/features/students/actions";
import { StudentForm } from "@/features/students/student-form";

type NewStudentPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewStudentPage({ params }: NewStudentPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireBillingAccess(locale);

  const action = createStudentAction.bind(null, locale);

  return (
    <StudentForm
      action={action}
      cancelHref={`/${locale}/students`}
    />
  );
}
