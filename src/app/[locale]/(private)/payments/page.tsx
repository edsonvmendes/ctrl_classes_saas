import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ArrowRight, CalendarRange, CircleDollarSign, CreditCard, Wallet } from "lucide-react";

import { ActionGroup } from "@/components/shared/action-group";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { SkeletonBlock } from "@/components/shared/page-loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import {
  generateMonthlyPaymentsAction,
  settlePaymentAction,
} from "@/features/payments/actions";
import { getPaymentsSnapshot, type PaymentFilter } from "@/features/payments/data";
import { GeneratePaymentsForm } from "@/features/payments/generate-payments-form";
import { SettlePaymentForm } from "@/features/payments/settle-payment-form";
import { formatCurrencyFromCents, formatDateOnly, formatMonthYear } from "@/lib/formatters/intl";
import type { PaymentMethod } from "@/types/payment";

type PaymentsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string; status?: string }>;
};

type PaymentsSnapshot = Awaited<ReturnType<typeof getPaymentsSnapshot>>;

const statuses = ["all", "pending", "paid", "overdue", "cancelled"] as const;
const methods: PaymentMethod[] = ["pix", "cash", "transfer", "card", "other"];

function buildPaymentsHref(locale: string, month: string, status: string) {
  const params = new URLSearchParams();
  params.set("month", month);

  if (status !== "all") {
    params.set("status", status);
  }

  return `/${locale}/payments?${params.toString()}`;
}

function getStatusTone(status: string) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "overdue" || status === "cancelled") {
    return "danger" as const;
  }

  if (status === "pending") {
    return "warm" as const;
  }

  return "neutral" as const;
}

function PaymentDetailCard({
  detail,
  label,
  value,
}: {
  detail?: string | null;
  label: string;
  value: string;
}) {
  return (
    <div className={insetCardStyles()}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-base font-semibold leading-6 text-[var(--brand-navy)]">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p> : null}
    </div>
  );
}

async function PaymentsPageContent({
  locale,
  snapshotPromise,
}: {
  locale: string;
  snapshotPromise: Promise<PaymentsSnapshot>;
}) {
  const [t, snapshot] = await Promise.all([
    getTranslations("Payments"),
    snapshotPromise,
  ]);
  const summaryCurrency = snapshot.payments[0]?.currency ?? "BRL";
  const generateAction = generateMonthlyPaymentsAction.bind(
    null,
    locale,
    snapshot.month,
    snapshot.status,
  );
  const methodOptions = methods.map((method) => ({
    label: t(`method${method.charAt(0).toUpperCase()}${method.slice(1)}`),
    value: method,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div data-testid="payments-generate-primary">
            <GeneratePaymentsForm action={generateAction} submitLabel={t("generateMonthly")} />
          </div>
        }
        description={t("description")}
        eyebrow={t("eyebrow")}
        icon={Wallet}
        title={t("title")}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <ActionGroup>
            <Link
              className={buttonStyles({ variant: "secondary" })}
              href={buildPaymentsHref(locale, snapshot.previousMonth, snapshot.status)}
            >
              {t("previousMonth")}
            </Link>
            <span className="inline-flex h-11 items-center rounded-full border border-[rgba(23,63,115,0.1)] bg-white/78 px-4 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
              {formatMonthYear(`${snapshot.month}-01`, locale)}
            </span>
            <Link
              className={buttonStyles({ variant: "secondary" })}
              href={buildPaymentsHref(locale, snapshot.nextMonth, snapshot.status)}
            >
              {t("nextMonth")}
            </Link>
          </ActionGroup>

          <ActionGroup compact>
            {statuses.map((statusOption) => (
              <Link
                key={statusOption}
                className={buttonStyles({
                  size: "sm",
                  variant: snapshot.status === statusOption ? "filterActive" : "filter",
                })}
                href={buildPaymentsHref(locale, snapshot.month, statusOption)}
              >
                {t(`status${statusOption.charAt(0).toUpperCase()}${statusOption.slice(1)}`)}
              </Link>
            ))}
          </ActionGroup>
        </div>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          detail={formatCurrencyFromCents(snapshot.totals.amountAll, locale, summaryCurrency)}
          icon={CircleDollarSign}
          label={t("summaryAll")}
          tone="blue"
          value={snapshot.totals.all}
        />
        <MetricCard
          detail={formatCurrencyFromCents(snapshot.totals.amountPending, locale, summaryCurrency)}
          icon={Wallet}
          label={t("summaryPending")}
          tone="warm"
          value={snapshot.totals.pending}
        />
        <MetricCard
          detail={formatCurrencyFromCents(snapshot.totals.amountPaid, locale, summaryCurrency)}
          icon={CreditCard}
          label={t("summaryPaid")}
          tone="success"
          value={snapshot.totals.paid}
        />
        <MetricCard
          detail={formatCurrencyFromCents(snapshot.totals.amountOverdue, locale, summaryCurrency)}
          icon={CalendarRange}
          label={t("summaryOverdue")}
          tone={snapshot.totals.overdue > 0 ? "warm" : "ink"}
          value={snapshot.totals.overdue}
        />
      </section>

      {snapshot.payments.length === 0 ? (
        <EmptyState
          action={
            <div data-testid="payments-generate-empty">
              <GeneratePaymentsForm action={generateAction} submitLabel={t("generateMonthly")} />
            </div>
          }
          description={t("emptyDescription")}
          title={t("emptyTitle")}
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="section-shell rounded-[32px] p-6">
            <SectionHeading
              description={t("summaryDescription")}
              icon={Wallet}
              title={t("summaryTitle")}
            />

            <div className="mt-5 grid gap-3">
              <div className={insetCardStyles()}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("summaryPending")}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
                  {formatCurrencyFromCents(snapshot.totals.amountPending, locale, summaryCurrency)}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("summaryPaid")}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
                  {formatCurrencyFromCents(snapshot.totals.amountPaid, locale, summaryCurrency)}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("summaryOverdue")}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-navy)]">
                  {formatCurrencyFromCents(snapshot.totals.amountOverdue, locale, summaryCurrency)}
                </p>
              </div>
            </div>
          </article>

          <article className="section-shell rounded-[32px] p-6">
            <SectionHeading
              action={
                <Link
                  className={buttonStyles({ size: "sm", variant: "secondary" })}
                  href={`/${locale}/students`}
                >
                  {t("openStudents")}
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              }
              description={t("listDescription")}
              icon={CircleDollarSign}
              title={t("listTitle")}
            />

            <div className="mt-6 space-y-3">
              {snapshot.payments.map((payment) => {
                const settleAction = settlePaymentAction.bind(
                  null,
                  locale,
                  payment.id,
                  snapshot.month,
                  snapshot.status,
                );
                const effectiveStatus = payment.effective_status ?? payment.status;

                return (
                  <div className={insetCardStyles({ padding: "lg" })} key={payment.id}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-slate-900">
                            {payment.student_name ?? t("studentFallback")}
                          </p>
                          <StatusBadge tone={getStatusTone(effectiveStatus)}>
                            {t(`status${effectiveStatus.charAt(0).toUpperCase()}${effectiveStatus.slice(1)}`)}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {payment.notes ?? payment.reference_month}
                        </p>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {t("tableAmount")}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[var(--brand-navy)]">
                          {formatCurrencyFromCents(payment.amount_cents, locale, payment.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <PaymentDetailCard
                        detail={
                          effectiveStatus === "paid" && payment.paid_at
                            ? formatDateOnly(payment.paid_at.slice(0, 10), locale)
                            : payment.method
                              ? t(`method${payment.method.charAt(0).toUpperCase()}${payment.method.slice(1)}`)
                              : null
                        }
                        label={t("tableDueDate")}
                        value={formatDateOnly(payment.due_date, locale)}
                      />
                      <PaymentDetailCard
                        detail={payment.reference_month}
                        label={t("tableMethod")}
                        value={payment.method ? t(`method${payment.method.charAt(0).toUpperCase()}${payment.method.slice(1)}`) : "-"}
                      />
                      <div className={`${insetCardStyles()} md:col-span-2`}>
                        <p className="text-sm font-semibold text-[var(--brand-navy)]">{t("tableStatus")}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {effectiveStatus === "paid"
                            ? payment.paid_at
                              ? formatDateOnly(payment.paid_at.slice(0, 10), locale)
                              : t("statusPaid")
                            : t("paymentNeedsAction")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                        {effectiveStatus !== "paid" && effectiveStatus !== "cancelled" ? (
                          <SettlePaymentForm
                            action={settleAction}
                            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                            methodOptions={methodOptions}
                            submitLabel={t("markPaid")}
                          />
                        ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

function PaymentsPageFallback() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <section className="section-shell rounded-[34px] p-7 md:p-8">
        <SkeletonBlock className="h-5 w-28 rounded-full" />
        <SkeletonBlock className="mt-4 h-10 w-1/2 rounded-[24px]" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-2xl rounded-full" />
        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-3">
            <SkeletonBlock className="h-11 w-28 rounded-full" />
            <SkeletonBlock className="h-11 w-32 rounded-full" />
            <SkeletonBlock className="h-11 w-28 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock className="h-10 w-20 rounded-full" key={index} />
            ))}
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

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="section-shell rounded-[32px] p-6">
          <SkeletonBlock className="h-5 w-28 rounded-full" />
          <SkeletonBlock className="mt-3 h-4 w-2/3 rounded-full" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock className="h-24 w-full rounded-[24px]" key={index} />
            ))}
          </div>
        </div>

        <div className="section-shell rounded-[32px] p-6">
          <SkeletonBlock className="h-5 w-32 rounded-full" />
          <SkeletonBlock className="mt-3 h-4 w-1/2 rounded-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-[26px] border border-[rgba(23,63,115,0.12)] bg-white/82 p-5" key={index}>
                <SkeletonBlock className="h-5 w-40 rounded-full" />
                <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-5 h-24 w-full rounded-[24px]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function PaymentsPage({
  params,
  searchParams,
}: PaymentsPageProps) {
  const { locale } = await params;
  const { month, status } = await searchParams;
  setRequestLocale(locale);

  const normalizedStatus =
    status && statuses.includes(status as (typeof statuses)[number]) ? status : "all";
  const snapshotPromise = getPaymentsSnapshot(locale, month, normalizedStatus as PaymentFilter);

  return (
    <Suspense fallback={<PaymentsPageFallback />}>
      <PaymentsPageContent locale={locale} snapshotPromise={snapshotPromise} />
    </Suspense>
  );
}
