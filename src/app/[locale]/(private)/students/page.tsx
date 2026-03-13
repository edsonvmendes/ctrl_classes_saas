import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CircleDollarSign, PencilLine, UserCheck, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { SkeletonBlock } from "@/components/shared/page-loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  buttonStyles,
  dataTableHeaderClassName,
  dataTableMutedTextClassName,
  dataTableRowClassName,
  insetCardStyles,
} from "@/components/shared/ui-primitives";
import { getStudents } from "@/features/students/data";
import { formatCurrencyFromCents } from "@/lib/formatters/intl";

type StudentsPageProps = {
  params: Promise<{ locale: string }>;
};

type StudentsSnapshot = Awaited<ReturnType<typeof getStudents>>;

function getStudentStatusLabel(
  status: "active" | "inactive" | "archived",
  t: Awaited<ReturnType<typeof getTranslations<"Students">>>,
) {
  if (status === "inactive") {
    return t("statusInactive");
  }

  if (status === "archived") {
    return t("statusArchived");
  }

  return t("statusActive");
}

async function StudentsPageContent({
  locale,
  studentsPromise,
}: {
  locale: string;
  studentsPromise: Promise<StudentsSnapshot>;
}) {
  const [t, students] = await Promise.all([
    getTranslations("Students"),
    studentsPromise,
  ]);
  const activeStudents = students.filter((student) => student.status === "active").length;
  const monthlyStudents = students.filter((student) => student.billing_type === "monthly").length;
  const perClassStudents = students.filter((student) => student.billing_type === "per_class").length;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className={buttonStyles({ variant: "primary" })}
            href={`/${locale}/students/new`}
          >
            {t("create")}
          </Link>
        }
        description={t("description")}
        eyebrow={t("tableStudent")}
        icon={Users}
        title={t("title")}
      >
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <MetricCard
            detail={t("tableStudent")}
            icon={Users}
            label={t("tableStudent")}
            value={students.length}
          />
          <MetricCard
            detail={t("statusActive")}
            icon={UserCheck}
            label={t("statusActive")}
            tone="success"
            value={activeStudents}
          />
          <MetricCard
            detail={`${monthlyStudents} ${t("billingMonthly")} / ${perClassStudents} ${t("billingPerClass")}`}
            icon={CircleDollarSign}
            label={t("billingType")}
            tone="warm"
            value={students.length > 0 ? `${monthlyStudents}/${perClassStudents}` : "0/0"}
          />
        </div>
      </PageHeader>

      {students.length === 0 ? (
        <EmptyState
          actionHref={`/${locale}/students/new`}
          actionLabel={t("create")}
          description={t("emptyDescription")}
          title={t("emptyTitle")}
        />
      ) : (
        <section className="space-y-4">
          <section className="section-shell motion-rise rounded-[30px] p-6">
            <SectionHeading
              description={t("description")}
              icon={Users}
              title={t("tableStudent")}
            />
          </section>

          <div className="grid gap-4 lg:hidden">
            {students.map((student) => (
              <article className="section-shell interactive-card motion-rise rounded-[30px] p-5" key={student.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{student.full_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {student.email ?? student.phone ?? t("contactFallback")}
                    </p>
                  </div>
                  <StatusBadge tone={student.status === "active" ? "success" : "neutral"}>
                    {getStudentStatusLabel(student.status, t)}
                  </StatusBadge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className={insetCardStyles()}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("tableBilling")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                      {student.billing_type === "monthly" ? t("billingMonthly") : t("billingPerClass")}
                    </p>
                  </div>
                  <div className={insetCardStyles()}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("tableValue")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                      {formatCurrencyFromCents(
                        student.billing_type === "monthly"
                          ? student.monthly_amount_cents
                          : student.class_rate_cents,
                        locale,
                        student.currency,
                      )}
                    </p>
                  </div>
                  <div className={insetCardStyles()}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("tableCurrency")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                      {student.currency}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    className={buttonStyles({ variant: "secondary" })}
                    href={`/${locale}/students/${student.id}/edit`}
                  >
                    <PencilLine aria-hidden="true" className="mr-2 h-4 w-4" />
                    {t("edit")}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <section className="section-shell hidden overflow-hidden rounded-[32px] lg:block">
            <div className={`grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-4 ${dataTableHeaderClassName}`}>
              <span>{t("tableStudent")}</span>
              <span>{t("tableBilling")}</span>
              <span>{t("tableValue")}</span>
              <span>{t("tableCurrency")}</span>
              <span>{t("tableStatus")}</span>
              <span className="text-right">{t("tableAction")}</span>
            </div>

            <div className="divide-y divide-slate-200/70">
              {students.map((student) => (
                <article
                  key={student.id}
                  className={`grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-4 ${dataTableRowClassName}`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{student.full_name}</p>
                    <p className="mt-1 text-slate-500">
                      {student.email ?? student.phone ?? t("contactFallback")}
                    </p>
                  </div>
                  <span className={dataTableMutedTextClassName}>
                    {student.billing_type === "monthly" ? t("billingMonthly") : t("billingPerClass")}
                  </span>
                  <span className={dataTableMutedTextClassName}>
                    {formatCurrencyFromCents(
                      student.billing_type === "monthly"
                        ? student.monthly_amount_cents
                        : student.class_rate_cents,
                      locale,
                      student.currency,
                    )}
                  </span>
                  <span className={dataTableMutedTextClassName}>{student.currency}</span>
                  <span>
                    <StatusBadge tone={student.status === "active" ? "success" : "neutral"}>
                      {getStudentStatusLabel(student.status, t)}
                    </StatusBadge>
                  </span>
                  <div className="text-right">
                    <Link
                      className="font-semibold text-[var(--brand-blue)] transition hover:text-[var(--brand-accent)]"
                      href={`/${locale}/students/${student.id}/edit`}
                    >
                      {t("edit")}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}

function StudentsPageFallback() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <section className="section-shell rounded-[34px] p-7 md:p-8">
        <SkeletonBlock className="h-5 w-32 rounded-full" />
        <SkeletonBlock className="mt-4 h-10 w-1/2 rounded-[24px]" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-2xl rounded-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rounded-[24px] border border-[rgba(23,63,115,0.1)] bg-white/80 p-5" key={index}>
              <SkeletonBlock className="h-4 w-24 rounded-full" />
              <SkeletonBlock className="mt-4 h-10 w-20 rounded-[18px]" />
              <SkeletonBlock className="mt-3 h-4 w-32 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell rounded-[30px] p-6">
        <SkeletonBlock className="h-5 w-28 rounded-full" />
        <SkeletonBlock className="mt-3 h-4 w-2/3 rounded-full" />
      </section>

      <section className="section-shell overflow-hidden rounded-[32px]">
        <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-4 border-b border-slate-200/80 px-6 py-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock className="h-4 w-full rounded-full" key={index} />
          ))}
        </div>
        <div className="divide-y divide-slate-200/70">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-4 px-6 py-5" key={index}>
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <SkeletonBlock className="h-5 w-full rounded-full" key={cellIndex} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const studentsPromise = getStudents(locale);

  return (
    <Suspense fallback={<StudentsPageFallback />}>
      <StudentsPageContent locale={locale} studentsPromise={studentsPromise} />
    </Suspense>
  );
}
