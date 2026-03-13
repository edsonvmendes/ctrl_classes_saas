"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { CalendarDays, CreditCard, ShieldCheck, Wallet } from "lucide-react";

import { ActionFeedback } from "@/components/shared/action-feedback";
import { CardLabel } from "@/components/shared/card-label";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import { formatOptionalDateOnly } from "@/lib/formatters/intl";
import type { SubscriptionRecord } from "@/types/subscription";

type SubscriptionActionState = {
  error?: string;
};

type SubscriptionCardProps = {
  checkoutAction: (
    state: SubscriptionActionState,
    formData: FormData,
  ) => Promise<SubscriptionActionState>;
  locale: string;
  portalAction: (
    state: SubscriptionActionState,
    formData: FormData,
  ) => Promise<SubscriptionActionState>;
  stripeConfigured: boolean;
  subscription: SubscriptionRecord;
};

const initialState: SubscriptionActionState = {};

function ActionButton({
  intent,
  label,
  pendingLabel,
}: {
  intent: "checkout" | "portal";
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={buttonStyles({ variant: intent === "checkout" ? "primary" : "secondary" })}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function SubscriptionCard({
  checkoutAction,
  locale,
  portalAction,
  stripeConfigured,
  subscription,
}: SubscriptionCardProps) {
  const t = useTranslations("Subscription");
  const [checkoutState, checkoutFormAction] = useActionState(checkoutAction, initialState);
  const [portalState, portalFormAction] = useActionState(portalAction, initialState);
  const statusTone =
    subscription.status === "active"
      ? "success"
      : subscription.status === "past_due" || subscription.status === "canceled"
        ? "danger"
        : "warm";

  return (
    <section className="section-shell rounded-[32px] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <CardLabel icon={CreditCard}>{t("eyebrow")}</CardLabel>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">{t("title")}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">{t("description")}</p>
        </div>
        <StatusBadge tone={statusTone}>
          {t(`status${subscription.status.charAt(0).toUpperCase()}${subscription.status.slice(1)}` as "statusActive")}
        </StatusBadge>
      </div>

      <div className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <div className={insetCardStyles()}>
          <CardLabel icon={CreditCard}>{t("plan")}</CardLabel>
          <p className="mt-2 text-sm font-medium capitalize text-slate-700">{subscription.plan_code}</p>
        </div>
        <div className={insetCardStyles()}>
          <CardLabel icon={ShieldCheck}>{t("status")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {t(`status${subscription.status.charAt(0).toUpperCase()}${subscription.status.slice(1)}`)}
          </p>
        </div>
        <div className={insetCardStyles()}>
          <CardLabel icon={CalendarDays}>{t("trialEndsAt")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {formatOptionalDateOnly(subscription.trial_ends_at, locale)}
          </p>
        </div>
        <div className={insetCardStyles()}>
          <CardLabel icon={Wallet}>{t("currentPeriodEnd")}</CardLabel>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {formatOptionalDateOnly(subscription.current_period_end, locale)}
          </p>
        </div>
      </div>

      <ActionFeedback
        className="mt-4"
        message={!stripeConfigured ? t("missingConfig") : undefined}
        tone="warning"
      />
      <ActionFeedback className="mt-4" message={checkoutState.error} tone="error" />
      <ActionFeedback className="mt-3" message={portalState.error} tone="error" />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form action={checkoutFormAction}>
          <ActionButton
            intent="checkout"
            label={t("startCheckout")}
            pendingLabel={t("redirecting")}
          />
        </form>
        <form action={portalFormAction}>
          <ActionButton
            intent="portal"
            label={t("openPortal")}
            pendingLabel={t("redirecting")}
          />
        </form>
      </div>
    </section>
  );
}
