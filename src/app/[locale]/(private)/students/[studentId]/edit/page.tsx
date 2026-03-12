import { setRequestLocale } from "next-intl/server";

import { requireBillingAccess } from "@/features/subscriptions/data";
import { getStudentById } from "@/features/students/data";
import { StudentForm } from "@/features/students/student-form";
import { updateStudentAction } from "@/features/students/actions";

type EditStudentPageProps = {
  params: Promise<{ locale: string; studentId: string }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { locale, studentId } = await params;
  setRequestLocale(locale);
  await requireBillingAccess(locale);

  const student = await getStudentById(studentId, locale);
  const action = updateStudentAction.bind(null, locale, studentId);

  return (
    <StudentForm
      action={action}
      cancelHref={`/${locale}/students`}
      student={student}
    />
  );
}
