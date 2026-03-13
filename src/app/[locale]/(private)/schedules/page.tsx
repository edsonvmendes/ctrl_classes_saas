import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Clock3,
  Pause,
  PauseCircle,
  PencilLine,
  Play,
  PlayCircle,
  Repeat2,
  Square,
  UserRound,
} from "lucide-react";

import { CardLabel } from "@/components/shared/card-label";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
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
import { updateScheduleStatusAction } from "@/features/schedules/actions";
import { getSchedulesOverview } from "@/features/schedules/data";
import { formatTimeRange } from "@/lib/datetime/timezone";
import { formatDateTimeInTimeZone } from "@/lib/formatters/intl";

type SchedulesPageProps = {
  params: Promise<{ locale: string }>;
};

type ScheduleActionIconButtonProps = {
  href?: string;
  icon: LucideIcon;
  label: string;
  compact?: boolean;
  tone?: "default" | "success" | "warning" | "danger";
};

function getActionButtonClass(
  tone: ScheduleActionIconButtonProps["tone"] = "default",
  compact = false,
) {
  if (tone === "success") {
    return buttonStyles({ size: compact ? "icon" : "sm", variant: compact ? "iconSuccess" : "secondary" });
  }

  if (tone === "warning") {
    return buttonStyles({ size: compact ? "icon" : "sm", variant: compact ? "iconWarning" : "secondary" });
  }

  if (tone === "danger") {
    return buttonStyles({ size: compact ? "icon" : "sm", variant: compact ? "iconDanger" : "secondary" });
  }

  return buttonStyles({ size: compact ? "icon" : "sm", variant: compact ? "icon" : "secondary" });
}

function ScheduleActionIconButton({
  href,
  icon: Icon,
  label,
  compact = false,
  tone = "default",
}: ScheduleActionIconButtonProps) {
  const className = getActionButtonClass(tone, compact);

  if (href) {
    return (
      <Link aria-label={label} className={className} href={href} title={label}>
        <Icon aria-hidden="true" className="h-4 w-4" />
        {compact ? <span className="sr-only">{label}</span> : <span className="ml-2">{label}</span>}
      </Link>
    );
  }

  return (
    <button aria-label={label} className={className} title={label} type="submit">
      <Icon aria-hidden="true" className="h-4 w-4" />
      {compact ? <span className="sr-only">{label}</span> : <span className="ml-2">{label}</span>}
    </button>
  );
}

function getScheduleStatusLabel(
  status: "active" | "paused" | "ended",
  t: Awaited<ReturnType<typeof getTranslations<"Schedules">>>,
) {
  if (status === "paused") {
    return t("statusPaused");
  }

  if (status === "ended") {
    return t("statusEnded");
  }

  return t("statusActive");
}

function getUpcomingClassStatusLabel(status: string) {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  if (status === "no_show") {
    return "No-show";
  }

  return "Scheduled";
}

export default async function SchedulesPage({ params }: SchedulesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Schedules");
  const { schedules, classes } = await getSchedulesOverview(locale);
  const activeSchedules = schedules.filter((schedule) => schedule.status === "active").length;
  const pausedSchedules = schedules.filter((schedule) => schedule.status === "paused").length;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className={buttonStyles({ variant: "primary" })}
            href={`/${locale}/schedules/new`}
          >
            {t("create")}
          </Link>
        }
        description={t("description")}
        eyebrow={t("scheduleTableTitle")}
        icon={Repeat2}
        title={t("title")}
      >
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <MetricCard
            detail={t("statusActive")}
            icon={PlayCircle}
            label={t("statusActive")}
            tone="success"
            value={activeSchedules}
          />
          <MetricCard
            detail={t("statusPaused")}
            icon={PauseCircle}
            label={t("statusPaused")}
            tone="warm"
            value={pausedSchedules}
          />
          <MetricCard
            detail={t("upcomingTitle")}
            icon={CalendarClock}
            label={t("upcomingTitle")}
            tone="ink"
            value={classes.length}
          />
        </div>
      </PageHeader>

      {schedules.length === 0 ? (
        <EmptyState
          actionHref={`/${locale}/schedules/new`}
          actionLabel={t("create")}
          description={t("emptyDescription")}
          title={t("emptyTitle")}
        />
      ) : (
        <section className="space-y-4">
          <section className="section-shell motion-rise rounded-[30px] p-6">
            <SectionHeading
              description={t("description")}
              icon={Repeat2}
              title={t("scheduleTableTitle")}
            />
          </section>

          <div className="grid gap-4 lg:hidden">
            {schedules.map((schedule) => (
              <article className="section-shell interactive-card motion-rise rounded-[30px] p-5" key={schedule.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{schedule.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {schedule.subject ?? schedule.timezone}
                    </p>
                  </div>
                  <StatusBadge tone={schedule.status === "active" ? "success" : "neutral"}>
                    {getScheduleStatusLabel(schedule.status, t)}
                  </StatusBadge>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className={insetCardStyles()}>
                    <CardLabel icon={UserRound}>{t("scheduleTableStudent")}</CardLabel>
                    <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                      {schedule.student_name ?? t("studentNoneShort")}
                    </p>
                  </div>
                  <div className={insetCardStyles()}>
                    <CardLabel icon={Clock3}>{t("scheduleTableTime")}</CardLabel>
                    <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                      {formatTimeRange(schedule.starts_at_time, schedule.duration_minutes)}
                    </p>
                  </div>
                  <div className={`${insetCardStyles()} sm:col-span-2`}>
                    <CardLabel icon={Repeat2}>{t("scheduleTableDays")}</CardLabel>
                    <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                      {schedule.by_weekday.map((day) => t(`weekday${day}`)).join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <ScheduleActionIconButton
                    href={`/${locale}/schedules/${schedule.id}/edit`}
                    compact={false}
                    icon={PencilLine}
                    label={t("edit")}
                  />

                  {schedule.status === "active" ? (
                    <form action={updateScheduleStatusAction.bind(null, locale, schedule.id, "paused")}>
                      <ScheduleActionIconButton compact={false} icon={Pause} label={t("pause")} tone="warning" />
                    </form>
                  ) : null}

                  {schedule.status === "paused" ? (
                    <form action={updateScheduleStatusAction.bind(null, locale, schedule.id, "active")}>
                      <ScheduleActionIconButton compact={false} icon={Play} label={t("resume")} tone="success" />
                    </form>
                  ) : null}

                  {schedule.status !== "ended" ? (
                    <form action={updateScheduleStatusAction.bind(null, locale, schedule.id, "ended")}>
                      <ScheduleActionIconButton compact={false} icon={Square} label={t("end")} tone="danger" />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <section className="section-shell hidden overflow-hidden rounded-[32px] lg:block">
            <div className={`grid grid-cols-[1.3fr_1fr_0.9fr_0.9fr_0.8fr_0.8fr] gap-4 ${dataTableHeaderClassName}`}>
              <span>{t("scheduleTableTitle")}</span>
              <span>{t("scheduleTableStudent")}</span>
              <span>{t("scheduleTableDays")}</span>
              <span>{t("scheduleTableTime")}</span>
              <span>{t("scheduleTableStatus")}</span>
              <span>{t("scheduleTableClasses")}</span>
            </div>

            <div className="divide-y divide-slate-200/70">
              {schedules.map((schedule) => (
                <article
                  key={schedule.id}
                  className={`grid grid-cols-[1.3fr_1fr_0.9fr_0.9fr_0.8fr_0.8fr] gap-4 ${dataTableRowClassName}`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{schedule.title}</p>
                    <p className="mt-1 text-slate-500">{schedule.subject ?? schedule.timezone}</p>
                  </div>
                  <span className={dataTableMutedTextClassName}>
                    {schedule.student_name ?? t("studentNoneShort")}
                  </span>
                  <span className={dataTableMutedTextClassName}>
                    {schedule.by_weekday.map((day) => t(`weekday${day}`)).join(", ")}
                  </span>
                  <span className={dataTableMutedTextClassName}>
                    {formatTimeRange(schedule.starts_at_time, schedule.duration_minutes)}
                  </span>
                  <span>
                    <StatusBadge tone={schedule.status === "active" ? "success" : "neutral"}>
                      {getScheduleStatusLabel(schedule.status, t)}
                    </StatusBadge>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ScheduleActionIconButton
                        href={`/${locale}/schedules/${schedule.id}/edit`}
                        compact
                        icon={PencilLine}
                        label={t("edit")}
                      />

                      {schedule.status === "active" ? (
                        <form action={updateScheduleStatusAction.bind(null, locale, schedule.id, "paused")}>
                          <ScheduleActionIconButton compact icon={Pause} label={t("pause")} tone="warning" />
                        </form>
                      ) : null}

                      {schedule.status === "paused" ? (
                        <form action={updateScheduleStatusAction.bind(null, locale, schedule.id, "active")}>
                          <ScheduleActionIconButton compact icon={Play} label={t("resume")} tone="success" />
                        </form>
                      ) : null}

                      {schedule.status !== "ended" ? (
                        <form action={updateScheduleStatusAction.bind(null, locale, schedule.id, "ended")}>
                          <ScheduleActionIconButton compact icon={Square} label={t("end")} tone="danger" />
                        </form>
                      ) : null}
                    </div>
                  </span>
                  <span className={dataTableMutedTextClassName}>
                    {t("generatedCount", { count: schedule.generated_classes_count })}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}

      <section className="section-shell overflow-hidden rounded-[34px]">
        <div className="border-b border-[rgba(23,63,115,0.1)] bg-white/58 px-6 py-5">
          <SectionHeading icon={CalendarClock} title={t("upcomingTitle")} />
        </div>

        {classes.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">{t("emptyDescription")}</p>
        ) : (
          <div className="divide-y divide-slate-200/70">
            {classes.map((classItem) => (
              <article
                key={classItem.id}
                className={`grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr] md:gap-4 ${dataTableRowClassName}`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{classItem.title}</p>
                  <p className="mt-1 text-slate-500">{classItem.subject ?? classItem.timezone}</p>
                </div>
                <span className={dataTableMutedTextClassName}>
                  {formatDateTimeInTimeZone(classItem.starts_at, locale, classItem.timezone)}
                </span>
                <span className={dataTableMutedTextClassName}>
                  {formatDateTimeInTimeZone(classItem.ends_at, locale, classItem.timezone)}
                </span>
                <span className={dataTableMutedTextClassName}>
                  {classItem.source === "schedule" ? t("sourceSchedule") : t("sourceManual")}
                </span>
                <span>
                  <StatusBadge tone={classItem.status === "completed" ? "success" : classItem.status === "scheduled" ? "warm" : "neutral"}>
                    {getUpcomingClassStatusLabel(classItem.status)}
                  </StatusBadge>
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
