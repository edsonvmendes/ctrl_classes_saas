import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarCheck2, CalendarClock, CalendarRange, Clock3, MapPinned, Sparkles, Tags } from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import { cancelClassAction, recordAttendanceAction } from "@/features/classes/actions";
import { buildAgendaUrl, type AgendaView } from "@/features/classes/agenda";
import { getAgendaSnapshot } from "@/features/classes/data";
import { canCancelClass, canRecordAttendance } from "@/features/classes/rules";
import {
  formatDateOnly,
  formatDateTimeInTimeZone,
  formatMonthYear,
  formatShortDate,
  formatTimeInTimeZone,
  formatWeekdayLabel,
} from "@/lib/formatters/intl";
import type { AttendanceStatus, ClassRecord, ClassStatus } from "@/types/schedule";

type AgendaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string; status?: string; view?: string }>;
};

const filters = ["all", "scheduled", "completed", "cancelled", "no_show"] as const;
const views: AgendaView[] = ["day", "week", "month"];
const attendanceActions: AttendanceStatus[] = ["present", "late", "excused", "absent"];

function getClassStatusLabel(
  status: ClassStatus,
  t: Awaited<ReturnType<typeof getTranslations<"Agenda">>>,
) {
  if (status === "completed") {
    return t("statusCompleted");
  }

  if (status === "cancelled") {
    return t("statusCancelled");
  }

  if (status === "no_show") {
    return t("statusNo_show");
  }

  return t("statusScheduled");
}

function getClassStatusTone(status: ClassStatus) {
  if (status === "completed") {
    return "success" as const;
  }

  if (status === "cancelled" || status === "no_show") {
    return "danger" as const;
  }

  return "warm" as const;
}

function getPeriodLabel(
  locale: string,
  timezone: string,
  view: AgendaView,
  selectedPeriodStart: string,
  days: { date: string }[],
) {
  if (view === "month") {
    return formatMonthYear(selectedPeriodStart, locale, timezone);
  }

  if (view === "week") {
    const firstDay = days[0]?.date ?? selectedPeriodStart;
    const lastDay = days[days.length - 1]?.date ?? selectedPeriodStart;
    return `${formatShortDate(firstDay, locale, timezone)} - ${formatShortDate(
      lastDay,
      locale,
      timezone,
    )}`;
  }

  return formatDateOnly(selectedPeriodStart, locale, timezone, { dateStyle: "full" });
}

function AgendaClassCard({
  classItem,
  locale,
  selectedDate,
  status,
  t,
  view,
}: {
  classItem: ClassRecord;
  locale: string;
  selectedDate: string;
  status: ClassStatus | "all";
  t: Awaited<ReturnType<typeof getTranslations<"Agenda">>>;
  view: AgendaView;
}) {
  const cancelAction = cancelClassAction.bind(
    null,
    locale,
    classItem.id,
    selectedDate,
    status,
    view,
  );

  return (
    <article className="section-shell interactive-card motion-rise rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-[var(--brand-navy)]">{classItem.title}</h2>
            <StatusBadge tone={getClassStatusTone(classItem.status)}>
              {getClassStatusLabel(classItem.status, t)}
            </StatusBadge>
          </div>

          <p className="text-sm text-slate-500">{classItem.student_name ?? t("studentNone")}</p>

          {classItem.attendance_status ? (
            <p className="text-sm font-medium text-emerald-700">
              {t("attendanceRegistered")}:{" "}
              {t(
                `attendance${classItem.attendance_status.charAt(0).toUpperCase()}${classItem.attendance_status.slice(1)}`,
              )}
            </p>
          ) : null}
        </div>

        {canCancelClass(classItem.status) ? (
          <form action={cancelAction}>
            <button
              className={buttonStyles({ variant: "secondary" })}
              type="submit"
            >
              {t("cancel")}
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <div className={insetCardStyles()}>
          <CardLabel icon={Clock3}>{t("startsAt")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {formatDateTimeInTimeZone(classItem.starts_at, locale, classItem.timezone)}
          </p>
        </div>
        <div className={insetCardStyles()}>
          <CardLabel icon={CalendarCheck2}>{t("endsAt")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {formatDateTimeInTimeZone(classItem.ends_at, locale, classItem.timezone)}
          </p>
        </div>
        <div className={insetCardStyles()}>
          <CardLabel icon={Tags}>{t("source")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {classItem.source === "schedule" ? t("sourceSchedule") : t("sourceManual")}
          </p>
        </div>
        <div className={insetCardStyles()}>
          <CardLabel icon={MapPinned}>{t("timezone")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">{classItem.timezone}</p>
        </div>
      </div>

      {canRecordAttendance(classItem.status, classItem.student_id) ? (
        <div className={`mt-5 ${insetCardStyles()}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{t("attendanceLabel")}</span>

            {attendanceActions.map((attendanceStatus) => {
              const attendanceAction = recordAttendanceAction.bind(
                null,
                locale,
                classItem.id,
                attendanceStatus,
                selectedDate,
                status,
                view,
              );

              return (
                <form action={attendanceAction} key={attendanceStatus}>
                  <button
                    className={buttonStyles({
                      size: "sm",
                      variant:
                        classItem.attendance_status === attendanceStatus ? "filterActive" : "filter",
                    })}
                    type="submit"
                  >
                    {t(
                      `attendance${attendanceStatus.charAt(0).toUpperCase()}${attendanceStatus.slice(1)}`,
                    )}
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      ) : null}

      {classItem.subject || classItem.notes || classItem.cancelled_reason ? (
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          {classItem.subject ? <p>{classItem.subject}</p> : null}
          {classItem.notes ? <p>{classItem.notes}</p> : null}
          {classItem.cancelled_reason ? (
            <p className="text-red-600">
              {t("cancelReason")}: {classItem.cancelled_reason}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default async function AgendaPage({ params, searchParams }: AgendaPageProps) {
  const { locale } = await params;
  const { date, status, view } = await searchParams;
  setRequestLocale(locale);

  const normalizedStatus =
    status && filters.includes(status as (typeof filters)[number]) ? status : "all";
  const normalizedView = view && views.includes(view as AgendaView) ? (view as AgendaView) : "day";

  const t = await getTranslations("Agenda");
  const snapshot = await getAgendaSnapshot(
    locale,
    date,
    normalizedStatus as ClassStatus | "all",
    normalizedView,
  );
  const allClasses = snapshot.days.flatMap((day) => day.classes);
  const completedCount = allClasses.filter((classItem) => classItem.status === "completed").length;
  const upcomingCount = allClasses.filter((classItem) => classItem.status === "scheduled").length;
  const noShowCount = allClasses.filter((classItem) => classItem.status === "no_show").length;

  const periodLabel = getPeriodLabel(
    locale,
    snapshot.timezone,
    snapshot.view,
    snapshot.selectedPeriodStart,
    snapshot.days,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <Link
              className={buttonStyles({ variant: "primary" })}
              href={`/${locale}/agenda/new`}
            >
              {t("createManualClass")}
            </Link>
            <Link
              className={buttonStyles({ variant: "secondary" })}
              href={buildAgendaUrl(locale, snapshot.previousDate, normalizedStatus, snapshot.view)}
            >
              {t("previousPeriod")}
            </Link>
            <Link
              className={buttonStyles({ variant: "secondary" })}
              href={buildAgendaUrl(locale, snapshot.nextDate, normalizedStatus, snapshot.view)}
            >
              {t("nextPeriod")}
            </Link>
          </div>
        }
        description={t("description")}
        eyebrow={t("title")}
        icon={CalendarRange}
        title={t("title")}
      >
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <MetricCard
            detail={periodLabel}
            icon={CalendarRange}
            label={t("title")}
            tone="blue"
            value={allClasses.length}
          />
          <MetricCard
            detail={t("statusScheduled")}
            icon={CalendarClock}
            label={t("statusScheduled")}
            tone="success"
            value={upcomingCount}
          />
          <MetricCard
            detail={t("statusCompleted")}
            icon={CalendarCheck2}
            label={t("statusCompleted")}
            tone={noShowCount > 0 ? "warm" : "ink"}
            value={completedCount}
          />
        </div>

        <div className="panel-subtle rounded-[28px] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <span className="inline-flex h-11 items-center rounded-full border border-[rgba(23,63,115,0.1)] bg-white/78 px-4 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
              {periodLabel}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {views.map((viewOption) => (
                <Link
                  key={viewOption}
                  className={buttonStyles({
                    size: "sm",
                    variant: snapshot.view === viewOption ? "filterActive" : "filter",
                  })}
                  href={buildAgendaUrl(locale, snapshot.selectedDate, normalizedStatus, viewOption)}
                >
                  {t(`view${viewOption.charAt(0).toUpperCase()}${viewOption.slice(1)}`)}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              {filters.map((filter) => (
                <Link
                  key={filter}
                  className={buttonStyles({
                    size: "sm",
                    variant: normalizedStatus === filter ? "filterActive" : "filter",
                  })}
                  href={buildAgendaUrl(locale, snapshot.selectedDate, filter, snapshot.view)}
                >
                  {t(`filter${filter.charAt(0).toUpperCase()}${filter.slice(1)}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageHeader>

      {snapshot.days.every((day) => day.classes.length === 0) ? (
        <EmptyState
          actionHref={`/${locale}/agenda/new`}
          actionLabel={t("createManualClass")}
          description={t("emptyDescription")}
          icon={Sparkles}
          title={t("emptyTitle")}
        />
      ) : null}

      {snapshot.view === "day" ? (
        <section className="space-y-4">
          {snapshot.days[0]?.classes.map((classItem) => (
            <AgendaClassCard
              classItem={classItem}
              key={classItem.id}
              locale={locale}
              selectedDate={snapshot.selectedDate}
              status={snapshot.status}
              t={t}
              view={snapshot.view}
            />
          ))}
        </section>
      ) : null}

      {snapshot.view === "week" ? (
        <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {snapshot.days.map((day) => (
            <section className="section-shell interactive-card rounded-[28px] p-4" key={day.date}>
              <div className="mb-4 border-b border-[rgba(23,63,115,0.08)] pb-3">
                <h2 className="text-sm font-semibold text-[var(--brand-navy)]">
                  {formatShortDate(day.date, locale, snapshot.timezone)}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {t("classesCount", { count: day.classes.length })}
                </p>
              </div>

              <div className="space-y-3">
                {day.classes.length === 0 ? (
                  <p className="text-sm text-slate-400">{t("emptyDay")}</p>
                ) : (
                  day.classes.map((classItem) => (
                    <div className={insetCardStyles()} key={classItem.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{classItem.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatTimeInTimeZone(classItem.starts_at, locale, classItem.timezone)}
                          </p>
                        </div>
                        <StatusBadge tone={getClassStatusTone(classItem.status)}>
                          {getClassStatusLabel(classItem.status, t)}
                        </StatusBadge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </section>
      ) : null}

      {snapshot.view === "month" ? (
        <section className="section-shell hidden overflow-hidden rounded-[32px] md:block">
          <div className="border-b border-[rgba(23,63,115,0.1)] bg-white/58 px-6 py-5">
            <SectionHeading
              description={periodLabel}
              icon={CalendarRange}
              title={t("viewMonth")}
            />
          </div>

          <div className="grid grid-cols-7 border-b border-[rgba(23,63,115,0.1)] bg-white/58">
            {snapshot.days.slice(0, 7).map((day) => (
              <div
                className="border-r border-[rgba(23,63,115,0.08)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 last:border-r-0"
                key={day.date}
              >
                {formatWeekdayLabel(day.date, locale, snapshot.timezone)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {snapshot.days.map((day) => (
              <div
                className={`min-h-40 border-r border-b border-[rgba(23,63,115,0.08)] p-3 last:border-r-0 ${
                  day.inCurrentPeriod ? "bg-white/74" : "bg-[rgba(241,246,252,0.76)]"
                }`}
                key={day.date}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Link
                    className="text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-blue)]"
                    href={buildAgendaUrl(locale, day.date, normalizedStatus, "day")}
                  >
                    {new Date(`${day.date}T12:00:00.000Z`).getUTCDate()}
                  </Link>
                  <span className="text-xs text-slate-400">
                    {t("classesCount", { count: day.classes.length })}
                  </span>
                </div>

                <div className="space-y-2">
                  {day.classes.slice(0, 3).map((classItem) => (
                    <Link
                      className="block rounded-[18px] border border-[rgba(23,63,115,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,246,252,0.92))] px-3 py-2 text-xs text-slate-800 shadow-[0_12px_22px_rgba(15,35,65,0.08)] transition duration-200 hover:translate-y-[-1px] hover:border-[rgba(255,111,97,0.28)]"
                      href={buildAgendaUrl(locale, day.date, normalizedStatus, "day")}
                      key={classItem.id}
                    >
                      <p className="font-semibold text-[var(--brand-navy)]">
                        {formatTimeInTimeZone(classItem.starts_at, locale, classItem.timezone)}
                      </p>
                      <p className="mt-1 truncate font-medium text-slate-700">{classItem.title}</p>
                    </Link>
                  ))}

                  {day.classes.length > 3 ? (
                    <Link
                      className="block text-xs font-semibold text-[var(--brand-blue)]"
                      href={buildAgendaUrl(locale, day.date, normalizedStatus, "day")}
                    >
                      {t("moreClasses", { count: day.classes.length - 3 })}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {snapshot.view === "month" ? (
        <section className="grid gap-4 md:hidden">
          {snapshot.days.map((day) => (
            <section className="section-shell interactive-card rounded-[28px] p-4" key={day.date}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <Link
                  className="text-sm font-semibold text-[var(--brand-navy)] hover:text-[var(--brand-blue)]"
                  href={buildAgendaUrl(locale, day.date, normalizedStatus, "day")}
                >
                  {formatShortDate(day.date, locale, snapshot.timezone)}
                </Link>
                <span className="text-xs text-slate-400">
                  {t("classesCount", { count: day.classes.length })}
                </span>
              </div>

              <div className="space-y-2">
                {day.classes.length === 0 ? (
                  <p className="text-sm text-slate-400">{t("emptyDay")}</p>
                ) : (
                  day.classes.slice(0, 4).map((classItem) => (
                    <Link
                      className="block rounded-[18px] border border-[rgba(23,63,115,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,246,252,0.92))] px-3 py-3 text-sm text-slate-800 shadow-[0_12px_22px_rgba(15,35,65,0.08)] transition duration-200 hover:translate-y-[-1px] hover:border-[rgba(255,111,97,0.28)]"
                      href={buildAgendaUrl(locale, day.date, normalizedStatus, "day")}
                      key={classItem.id}
                    >
                      <p className="font-semibold text-[var(--brand-navy)]">
                        {formatTimeInTimeZone(classItem.starts_at, locale, classItem.timezone)}
                      </p>
                      <p className="mt-1 truncate font-medium text-slate-700">{classItem.title}</p>
                    </Link>
                  ))
                )}
              </div>
            </section>
          ))}
        </section>
      ) : null}
    </div>
  );
}
