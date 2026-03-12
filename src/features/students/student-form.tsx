"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Coins,
  Mail,
  NotebookPen,
  Phone,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

import { ActionFeedback } from "@/components/shared/action-feedback";
import { FormFieldShell } from "@/components/shared/form-field-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonStyles, fieldStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import type { StudentActionState } from "@/features/students/actions";
import type { StudentRecord } from "@/types/student";

type StudentFormProps = {
  action: (
    state: StudentActionState,
    formData: FormData,
  ) => Promise<StudentActionState>;
  cancelHref: string;
  student?: StudentRecord;
};

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Students");

  return (
    <button
      className={buttonStyles({ size: "lg", variant: "primary" })}
      disabled={pending}
      type="submit"
    >
      {pending ? t("saving") : label}
    </button>
  );
}

const initialState: StudentActionState = {};

function centsToInput(value: number | null) {
  if (value === null) {
    return "";
  }

  return (value / 100).toFixed(2);
}

function getStudentStatusLabel(
  status: "active" | "inactive" | "archived",
  t: ReturnType<typeof useTranslations<"Students">>,
) {
  if (status === "inactive") {
    return t("statusInactive");
  }

  if (status === "archived") {
    return t("statusArchived");
  }

  return t("statusActive");
}

export function StudentForm({
  action,
  cancelHref,
  student,
}: StudentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const t = useTranslations("Students");
  const formTitle = student ? t("editTitle") : t("createTitle");
  const submitLabel = student ? t("save") : t("createSubmit");
  const [displayName, setDisplayName] = useState(student?.full_name ?? "");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(student?.status ?? "active");
  const [billingType, setBillingType] = useState<"monthly" | "per_class">(student?.billing_type ?? "monthly");
  const [currency, setCurrency] = useState<"BRL" | "USD" | "EUR">(
    student?.currency === "USD" || student?.currency === "EUR" ? student.currency : "BRL",
  );
  const [chargeNoShow, setChargeNoShow] = useState(student?.charge_no_show ?? true);

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="panel-soft rounded-[34px] p-8">
            <SectionHeading
              description={t("formDescription")}
              icon={UserRound}
              title={formTitle}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <FormFieldShell
                icon={<UserRound aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("fullName")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={displayName}
                  name="full_name"
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </FormFieldShell>

              <FormFieldShell
                description={t("statusHint")}
                icon={<BadgeCheck aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("status")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={status}
                  name="status"
                  onChange={(event) => setStatus(event.target.value as "active" | "inactive" | "archived")}
                >
                  <option value="active">{t("statusActive")}</option>
                  <option value="inactive">{t("statusInactive")}</option>
                  <option value="archived">{t("statusArchived")}</option>
                </select>
              </FormFieldShell>

              <FormFieldShell
                description={t("emailHint")}
                icon={<Mail aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("email")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={student?.email ?? ""}
                  name="email"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                />
              </FormFieldShell>

              <FormFieldShell
                description={t("phoneHint")}
                icon={<Phone aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("phone")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={student?.phone ?? ""}
                  name="phone"
                  placeholder={t("phonePlaceholder")}
                />
              </FormFieldShell>
            </div>
          </section>

          <section className="section-shell rounded-[34px] p-8">
            <SectionHeading
              description={t("billingDescription")}
              icon={CircleDollarSign}
              title={t("billingSectionTitle")}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <FormFieldShell
                description={t("currencyHint")}
                icon={<Coins aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("currency")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={currency}
                  name="currency"
                  onChange={(event) => setCurrency(event.target.value as "BRL" | "USD" | "EUR")}
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </FormFieldShell>

              <FormFieldShell
                description={t("billingTypeHint")}
                icon={<CircleDollarSign aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("billingType")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={billingType}
                  name="billing_type"
                  onChange={(event) => setBillingType(event.target.value as "monthly" | "per_class")}
                >
                  <option value="monthly">{t("billingMonthly")}</option>
                  <option value="per_class">{t("billingPerClass")}</option>
                </select>
              </FormFieldShell>

              <FormFieldShell
                description={t("monthlyAmountHint")}
                icon={<Wallet aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("monthlyAmount")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={centsToInput(student?.monthly_amount_cents ?? null)}
                  name="monthly_amount"
                  placeholder="0.00"
                />
              </FormFieldShell>

              <FormFieldShell
                description={t("classRateHint")}
                icon={<Wallet aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("classRate")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={centsToInput(student?.class_rate_cents ?? null)}
                  name="class_rate"
                  placeholder="0.00"
                />
              </FormFieldShell>

              <FormFieldShell
                description={t("billingDayHint")}
                icon={<CalendarDays aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("billingDay")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={student?.billing_day_of_month ?? ""}
                  max="28"
                  min="1"
                  name="billing_day_of_month"
                  type="number"
                />
              </FormFieldShell>
            </div>
          </section>

          <section className="section-shell rounded-[34px] p-8">
            <SectionHeading
              description={t("preferencesDescription")}
              icon={ShieldCheck}
              title={t("preferencesSectionTitle")}
            />

            <div className="mt-8 grid gap-6">
              <label className={`${insetCardStyles({ padding: "lg" })} flex items-start gap-4`}>
                <input
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                  defaultChecked={chargeNoShow}
                  name="charge_no_show"
                  onChange={(event) => setChargeNoShow(event.target.checked)}
                  type="checkbox"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-slate-800">{t("chargeNoShow")}</span>
                  <span className="block text-sm leading-6 text-slate-500">
                    {t("chargeNoShowDescription")}
                  </span>
                </span>
              </label>

              <FormFieldShell
                description={t("notesDescription")}
                icon={<NotebookPen aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("notes")}
              >
                <textarea
                  className={fieldStyles({ control: "textarea" })}
                  defaultValue={student?.notes ?? ""}
                  name="notes"
                  placeholder={t("notesPlaceholder")}
                />
              </FormFieldShell>
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="panel-soft rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-blue)]">
              {t("overviewTitle")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {student ? t("overviewEditState") : t("overviewCreateState")}
            </p>
          </section>

          <section className="section-shell rounded-[30px] p-6">
            <div className="space-y-4">
              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("fullName")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--brand-navy)]">
                  {displayName || t("overviewNameFallback")}
                </p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("billingType")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {billingType === "per_class" ? t("billingPerClass") : t("billingMonthly")}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {billingType === "per_class" ? t("overviewPerClass") : t("overviewMonthly")}
                </p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("status")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {getStudentStatusLabel(status, t)}
                </p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("currency")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{currency}</p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("chargeNoShow")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {chargeNoShow ? t("overviewChargeNoShowOn") : t("overviewChargeNoShowOff")}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <ActionFeedback message={state.error} tone="error" />
      <ActionFeedback message={state.success} tone="success" />

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton label={submitLabel} />
        <Link
          className={buttonStyles({ size: "lg", variant: "secondary" })}
          href={cancelHref}
        >
          {t("back")}
        </Link>
      </div>
    </form>
  );
}
