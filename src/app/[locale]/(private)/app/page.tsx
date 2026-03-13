import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Globe2,
  MapPinned,
  Plus,
  Repeat2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { ActionGroup } from "@/components/shared/action-group";
import { CardLabel } from "@/components/shared/card-label";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { SkeletonBlock } from "@/components/shared/page-loading-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { TimelineItem } from "@/components/shared/timeline-item";
import { buttonStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import { getDashboardSnapshot } from "@/features/dashboard/data";
import {
  formatCurrencyFromCents,
  formatDateOnly,
  formatTimeInTimeZone,
} from "@/lib/formatters/intl";

type AppPageProps = {
  params: Promise<{ locale: string }>;
};

type DashboardSnapshot = Awaited<ReturnType<typeof getDashboardSnapshot>>;

function getGreetingKey(hour: number) {
  if (hour < 12) {
    return "greetingMorning";
  }

  if (hour < 18) {
    return "greetingAfternoon";
  }

  return "greetingEvening";
}

function getLocaleLabel(locale: string, t: Awaited<ReturnType<typeof getTranslations<"Dashboard">>>) {
  if (locale === "en-US") {
    return t("languageEnUs");
  }

  if (locale === "es-ES") {
    return t("languageEsEs");
  }

  return t("languagePtBr");
}

function getTimezoneLabel(timezone: string) {
  return timezone.split("/").at(-1)?.replaceAll("_", " ") ?? timezone;
}

function getSubscriptionStatusLabel(
  status: string,
  t: Awaited<ReturnType<typeof getTranslations<"Subscription">>>,
) {
  if (status === "past_due") {
    return t("statusPast_due");
  }

  return t(`status${status.charAt(0).toUpperCase()}${status.slice(1)}` as "statusActive");
}

function getHeroSubtitle(
  snapshot: DashboardSnapshot,
  t: Awaited<ReturnType<typeof getTranslations<"Dashboard">>>,
) {
  const currentOrNextClass = snapshot.todayTimeline.find((classItem) => classItem.isNow || classItem.isNext);

  if (currentOrNextClass?.isNow) {
    return t("heroNowClass", { title: currentOrNextClass.title });
  }

  if (snapshot.stats.todayClasses > 0 && currentOrNextClass?.relativeStartLabel) {
    return t("heroTodayWithNext", {
      count: snapshot.stats.todayClasses,
      time: currentOrNextClass.relativeStartLabel,
    });
  }

  if (snapshot.stats.pendingPayments > 0) {
    return t("heroPendingPayments", { count: snapshot.stats.pendingPayments });
  }

  return t("heroQuietDay");
}

function formatRelativeActivityTime(locale: string, occurredAt: string) {
  const diffMs = new Date(occurredAt).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

function getStudentsDetail(
  delta: number,
  t: Awaited<ReturnType<typeof getTranslations<"Dashboard">>>,
) {
  if (delta > 0) {
    return t("studentsGrowthPositive", { count: delta });
  }

  if (delta < 0) {
    return t("studentsGrowthNegative", { count: Math.abs(delta) });
  }

  return t("studentsGrowthNeutral");
}

function getActivityContent(
  item: DashboardSnapshot["recentActivity"][number],
  locale: string,
  t: Awaited<ReturnType<typeof getTranslations<"Dashboard">>>,
) {
  if (item.key === "payment") {
    return {
      detail: formatRelativeActivityTime(locale, item.occurredAt),
      statusLabel:
        item.status === "paid" ? t("activityPaid") : t("activityPending"),
      statusTone: item.status === "paid" ? "success" : "warm",
      subtitle: item.amountCents && item.currency
        ? formatCurrencyFromCents(item.amountCents, locale, item.currency)
        : null,
      title: item.status === "paid"
        ? t("activityPaymentReceived", { name: item.studentName ?? t("timelineNoStudent") })
        : t("activityPaymentPending", { name: item.studentName ?? t("timelineNoStudent") }),
    } as const;
  }

  if (item.key === "schedule") {
    return {
      detail: formatRelativeActivityTime(locale, item.occurredAt),
      statusLabel: t("activitySchedule"),
      statusTone: "neutral",
      subtitle: item.studentName ?? t("timelineNoStudent"),
      title: t("activityScheduleUpdated", { title: item.title ?? "-" }),
    } as const;
  }

  if (item.key === "student") {
    return {
      detail: formatRelativeActivityTime(locale, item.occurredAt),
      statusLabel: t("activityStudent"),
      statusTone: "neutral",
      subtitle: item.status ? t(`studentStatus${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}` as "studentStatusActive") : null,
      title: t("activityStudentTouched", { name: item.studentName ?? "-" }),
    } as const;
  }

  return {
    detail: formatRelativeActivityTime(locale, item.occurredAt),
    statusLabel: t("activityClass"),
    statusTone: item.status === "completed" ? "success" : item.status === "cancelled" ? "danger" : "warm",
    subtitle: item.studentName ?? t("timelineNoStudent"),
    title: t("activityClassToday", { title: item.title ?? "-" }),
  } as const;
}

async function DashboardPageContent({
  locale,
  snapshotPromise,
}: {
  locale: string;
  snapshotPromise: Promise<DashboardSnapshot>;
}) {
  const [t, subscriptionT, snapshot] = await Promise.all([
    getTranslations("Dashboard"),
    getTranslations("Subscription"),
    snapshotPromise,
  ]);
  const currentHour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: snapshot.partner.timezone,
  }).formatToParts(new Date()).find((part) => part.type === "hour")?.value;

  const greeting = t(getGreetingKey(Number(currentHour ?? "9")), {
    name: snapshot.partner.display_name,
  });
  const heroSubtitle = getHeroSubtitle(snapshot, t);

  return (
    <div className="space-y-6">
      <section className="panel-soft hero-glow motion-rise rounded-[34px] p-7 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <CardLabel icon={CalendarClock}>{t("eyebrow")}</CardLabel>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-[var(--brand-navy)] md:text-5xl">
              {greeting}
            </h1>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              {formatDateOnly(snapshot.today, locale, snapshot.partner.timezone, { dateStyle: "full" })}
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{heroSubtitle}</p>
          </div>

          <ActionGroup>
            <Link
              className={buttonStyles({ variant: "primary" })}
              href={`/${locale}/agenda/new`}
            >
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
              {t("openNewClass")}
            </Link>
            <Link
              className={buttonStyles({ variant: "secondary" })}
              href={`/${locale}/students/new`}
            >
              <Users aria-hidden="true" className="mr-2 h-4 w-4" />
              {t("openNewStudent")}
            </Link>
          </ActionGroup>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className={buttonStyles({ size: "sm", variant: "filter" })} href={`/${locale}/agenda`}>
            <CalendarDays aria-hidden="true" className="mr-2 h-4 w-4" />
            {t("openAgenda")}
          </Link>
          <Link className={buttonStyles({ size: "sm", variant: "filter" })} href={`/${locale}/payments`}>
            <CircleDollarSign aria-hidden="true" className="mr-2 h-4 w-4" />
            {t("openPayments")}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Link className="block" href={`/${locale}/agenda`}>
          <MetricCard
            detail={
              snapshot.currentMoment.nextLabel
                ? t("todayClassesWithNext", { time: snapshot.currentMoment.nextLabel })
                : t("todayClassesDetail")
            }
            icon={CalendarDays}
            label={t("todayClasses")}
            tone="warm"
            value={snapshot.stats.todayClasses}
          />
        </Link>
        <Link className="block" href={`/${locale}/students`}>
          <MetricCard
            detail={getStudentsDetail(snapshot.comparisons.studentsDeltaThisMonth, t)}
            icon={Users}
            label={t("students")}
            value={snapshot.stats.activeStudents}
          />
        </Link>
        <Link className="block" href={`/${locale}/schedules`}>
          <MetricCard
            detail={t("activeSchedulesDetail")}
            icon={Repeat2}
            label={t("activeSchedules")}
            tone="ink"
            value={snapshot.stats.activeSchedules}
          />
        </Link>
        <Link className="block" href={`/${locale}/payments`}>
          <MetricCard
            detail={
              snapshot.stats.pendingPayments > 0 ? t("pendingPaymentsDetail") : t("pendingPaymentsEmpty")
            }
            icon={Wallet}
            label={t("pendingPayments")}
            tone={snapshot.stats.pendingPayments > 0 ? "warm" : "success"}
            value={snapshot.stats.pendingPayments}
          />
        </Link>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
        <div className="space-y-6">
          <article className="section-shell motion-rise motion-delay-1 rounded-[34px] p-8">
            <SectionHeading
              action={
                <Link
                  className={buttonStyles({ size: "sm", variant: "secondary" })}
                  href={`/${locale}/agenda?view=day`}
                >
                  {t("openAgenda")}
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              }
              description={t("timelineDescription")}
              icon={CalendarClock}
              title={t("timelineTitle")}
            />

            <div className="mt-6 space-y-3">
              {snapshot.todayTimeline.length === 0 ? (
                <EmptyState
                  actionHref={`/${locale}/agenda`}
                  actionLabel={t("openAgenda")}
                  description={t("timelineEmptyDescription")}
                  title={t("timelineEmptyTitle")}
                />
              ) : (
                snapshot.todayTimeline.map((classItem) => (
                  <TimelineItem
                    detail={t("timelineDuration", { count: classItem.durationMinutes })}
                    href={`/${locale}/agenda?view=day&date=${snapshot.today}`}
                    key={classItem.id}
                    meta={
                      <>
                        {classItem.source === "schedule" ? (
                          <StatusBadge tone="neutral">{t("timelineSourceSchedule")}</StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">{t("timelineSourceManual")}</StatusBadge>
                        )}
                        {classItem.isNow ? (
                          <StatusBadge tone="warm">{t("timelineNow")}</StatusBadge>
                        ) : null}
                        {!classItem.isNow && classItem.isNext && classItem.relativeStartLabel ? (
                          <StatusBadge tone="neutral">
                            {t("timelineStartsIn", { time: classItem.relativeStartLabel })}
                          </StatusBadge>
                        ) : null}
                      </>
                    }
                    statusLabel={t(
                      `timelineStatus${classItem.status.charAt(0).toUpperCase()}${classItem.status.slice(1)}` as "timelineStatusScheduled",
                    )}
                    statusTone={
                      classItem.status === "completed"
                        ? "success"
                        : classItem.status === "cancelled"
                          ? "danger"
                          : classItem.isNow || classItem.isNext
                            ? "warm"
                            : "neutral"
                    }
                    subtitle={
                      classItem.student_name
                        ? classItem.subject
                          ? `${classItem.student_name} - ${classItem.subject}`
                          : classItem.student_name
                        : t("timelineNoStudent")
                    }
                    timeLabel={formatTimeInTimeZone(classItem.starts_at, locale, classItem.timezone)}
                    title={classItem.title}
                  />
                ))
              )}
            </div>
          </article>

          <article className="section-shell motion-rise motion-delay-2 rounded-[34px] p-8">
            <SectionHeading
              description={t("activityDescription")}
              icon={Sparkles}
              title={t("activityTitle")}
            />

            <div className="mt-6 space-y-3">
              {snapshot.recentActivity.length === 0 ? (
                <EmptyState
                  description={t("activityEmptyDescription")}
                  title={t("activityEmptyTitle")}
                />
              ) : (
                snapshot.recentActivity.map((item) => {
                  const content = getActivityContent(item, locale, t);

                  return (
                    <TimelineItem
                      href={item.href}
                      key={`${item.key}-${item.id}`}
                      statusLabel={content.statusLabel}
                      statusTone={content.statusTone}
                      subtitle={content.subtitle}
                      timeLabel={content.detail}
                      title={content.title}
                    />
                  );
                })
              )}
            </div>
          </article>
        </div>

        <aside className="space-y-6 2xl:sticky 2xl:top-6 2xl:self-start">
          <article className="section-shell motion-rise motion-delay-2 rounded-[34px] p-6">
            <SectionHeading
              description={t("onboardingDescription")}
              icon={Sparkles}
              title={t("onboardingTitle")}
            />

            <div className="mt-5 rounded-[24px] bg-white/78 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--brand-navy)]">
                  {t("onboardingProgress", {
                    completed: snapshot.onboarding.completed,
                    total: snapshot.onboarding.total,
                  })}
                </p>
                <StatusBadge tone={snapshot.onboarding.completed === snapshot.onboarding.total ? "success" : "warm"}>
                  {snapshot.onboarding.completed === snapshot.onboarding.total ? t("onboardingDone") : t("onboardingInProgress")}
                </StatusBadge>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#173f73_0%,#ff6f61_100%)]"
                  style={{ width: `${(snapshot.onboarding.completed / snapshot.onboarding.total) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {snapshot.onboarding.steps.map((step) => (
                <Link className={`${insetCardStyles()} flex items-center justify-between`} href={step.href} key={step.key}>
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-navy)]">
                      {t(`onboardingStep${step.key.charAt(0).toUpperCase()}${step.key.slice(1)}` as "onboardingStepProfile")}
                    </p>
                  </div>
                  <StatusBadge tone={step.completed ? "success" : "warm"}>
                    {step.completed ? t("onboardingStepDone") : t("onboardingStepPending")}
                  </StatusBadge>
                </Link>
              ))}
            </div>
          </article>

          <article className="section-shell motion-rise motion-delay-3 rounded-[34px] p-6">
            <SectionHeading
              description={t("weekDescription")}
              icon={CalendarDays}
              title={t("weekTitle")}
            />

            <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              <div className={insetCardStyles()}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("weekClasses")}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
                  {snapshot.weeklySummary.completedClasses}/{snapshot.weeklySummary.totalClasses}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("weekAttendance")}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
                  {snapshot.weeklySummary.attendanceRate}%
                </p>
              </div>
              <div className={insetCardStyles()}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("weekRevenue")}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--brand-navy)]">
                  {formatCurrencyFromCents(snapshot.weeklySummary.revenueCents, locale, snapshot.partner.currency)}
                </p>
              </div>
            </div>
          </article>

          <article className="section-shell motion-rise motion-delay-3 rounded-[34px] p-6">
            <SectionHeading
              description={t("overviewAsideDescription")}
              icon={CreditCard}
              title={t("overviewAsideTitle")}
            />

            <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              <div className={insetCardStyles()}>
                <CardLabel icon={CreditCard}>{t("subscriptionPlan")}</CardLabel>
                <p className="mt-3 text-lg font-semibold capitalize text-[var(--brand-navy)]">
                  {snapshot.subscription.plan_code}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <CardLabel icon={Wallet}>{t("subscriptionStatus")}</CardLabel>
                <p className="mt-3 text-lg font-semibold capitalize text-[var(--brand-navy)]">
                  {getSubscriptionStatusLabel(snapshot.subscription.status, subscriptionT)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className={insetCardStyles()}>
                <CardLabel icon={Globe2}>{t("tenantLocale")}</CardLabel>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {getLocaleLabel(snapshot.partner.locale, t)}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <CardLabel icon={MapPinned}>{t("tenantTimezone")}</CardLabel>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {getTimezoneLabel(snapshot.partner.timezone)}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <CardLabel icon={Wallet}>{t("tenantCurrency")}</CardLabel>
                <p className="mt-3 text-sm font-semibold text-slate-700">{snapshot.partner.currency}</p>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

function DashboardPageFallback() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <section className="section-shell rounded-[34px] p-7 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl flex-1">
            <SkeletonBlock className="h-5 w-32 rounded-full" />
            <SkeletonBlock className="mt-5 h-11 w-2/3 rounded-[24px]" />
            <SkeletonBlock className="mt-3 h-4 w-44 rounded-full" />
            <SkeletonBlock className="mt-4 h-5 w-full max-w-2xl rounded-full" />
            <SkeletonBlock className="mt-2 h-5 w-5/6 max-w-xl rounded-full" />
          </div>

          <div className="flex flex-wrap gap-3">
            <SkeletonBlock className="h-11 w-40 rounded-full" />
            <SkeletonBlock className="h-11 w-40 rounded-full" />
            <SkeletonBlock className="h-11 w-36 rounded-full" />
            <SkeletonBlock className="h-11 w-40 rounded-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="section-shell rounded-[28px] p-5" key={index}>
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="mt-4 h-10 w-20 rounded-[18px]" />
            <SkeletonBlock className="mt-3 h-4 w-32 rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="section-shell rounded-[34px] p-8" key={index}>
              <SkeletonBlock className="h-5 w-28 rounded-full" />
              <SkeletonBlock className="mt-3 h-8 w-1/3 rounded-[20px]" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <div
                    className="rounded-[26px] border border-[rgba(23,63,115,0.1)] bg-white/78 p-5"
                    key={itemIndex}
                  >
                    <SkeletonBlock className="h-5 w-40 rounded-full" />
                    <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
                    <SkeletonBlock className="mt-2 h-4 w-2/3 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="section-shell rounded-[34px] p-6" key={index}>
              <SkeletonBlock className="h-5 w-24 rounded-full" />
              <SkeletonBlock className="mt-3 h-8 w-1/2 rounded-[18px]" />
              <div className="mt-5 grid gap-3">
                {Array.from({ length: index === 0 ? 4 : 3 }).map((__, itemIndex) => (
                  <SkeletonBlock className="h-20 w-full rounded-[24px]" key={itemIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default async function AppPage({ params }: AppPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const snapshotPromise = getDashboardSnapshot(locale);

  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardPageContent locale={locale} snapshotPromise={snapshotPromise} />
    </Suspense>
  );
}
