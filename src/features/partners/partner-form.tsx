"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Building2,
  CircleDollarSign,
  Globe2,
  MonitorPlay,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ActionFeedback } from "@/components/shared/action-feedback";
import { FormFieldShell } from "@/components/shared/form-field-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonStyles, fieldStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import type { PartnerActionState } from "@/features/partners/actions";
import type { PartnerRecord } from "@/types/partner";

type PartnerFormProps = {
  action: (
    state: PartnerActionState,
    formData: FormData,
  ) => Promise<PartnerActionState>;
  description: string;
  partner: PartnerRecord;
  submitLabel: string;
  title: string;
};

const initialState: PartnerActionState = {};

function getLocaleLabel(
  locale: "pt-BR" | "en-US" | "es-ES",
  t: ReturnType<typeof useTranslations<"PartnerForm">>,
) {
  if (locale === "en-US") {
    return t("localeEnUs");
  }

  if (locale === "es-ES") {
    return t("localeEsEs");
  }

  return t("localePtBr");
}

function getTeachingModeLabel(
  teachingMode: PartnerRecord["teaching_mode"],
  t: ReturnType<typeof useTranslations<"PartnerForm">>,
) {
  if (!teachingMode) {
    return t("notSet");
  }

  return t(`teachingMode${teachingMode.charAt(0).toUpperCase()}${teachingMode.slice(1)}` as "teachingModeIndividual");
}

function getClassModeLabel(
  classMode: PartnerRecord["class_mode"],
  t: ReturnType<typeof useTranslations<"PartnerForm">>,
) {
  if (!classMode) {
    return t("notSet");
  }

  if (classMode === "in_person") {
    return t("classModeInPerson");
  }

  return t(`classMode${classMode.charAt(0).toUpperCase()}${classMode.slice(1)}` as "classModeOnline");
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("PartnerForm");

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

export function PartnerForm({
  action,
  description,
  partner,
  submitLabel,
  title,
}: PartnerFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const t = useTranslations("PartnerForm");
  const [displayName, setDisplayName] = useState(partner.display_name);
  const [locale, setLocale] = useState(partner.locale);
  const [currency, setCurrency] = useState(partner.currency);
  const [timezone, setTimezone] = useState(partner.timezone);
  const [teachingMode, setTeachingMode] = useState(partner.teaching_mode);
  const [classMode, setClassMode] = useState(partner.class_mode);

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="panel-soft rounded-[34px] p-8">
            <SectionHeading
              description={description}
              icon={UserRound}
              title={title}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <FormFieldShell
                icon={<UserRound aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("displayName")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={partner.display_name}
                  name="display_name"
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </FormFieldShell>

              <FormFieldShell
                icon={<Building2 aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("legalName")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={partner.legal_name ?? ""}
                  name="legal_name"
                />
              </FormFieldShell>

              <FormFieldShell
                icon={<Phone aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("phone")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={partner.phone ?? ""}
                  name="phone"
                />
              </FormFieldShell>

              <FormFieldShell
                icon={<Globe2 aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("timezone")}
              >
                <input
                  className={fieldStyles()}
                  defaultValue={partner.timezone}
                  name="timezone"
                  onChange={(event) => setTimezone(event.target.value)}
                  required
                />
              </FormFieldShell>
            </div>
          </section>

          <section className="section-shell rounded-[34px] p-8">
            <SectionHeading
              description={t("preferencesDescription")}
              icon={Sparkles}
              title={t("preferencesTitle")}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <FormFieldShell
                icon={<Globe2 aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("locale")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={partner.locale}
                  name="locale"
                  onChange={(event) => setLocale(event.target.value as PartnerRecord["locale"])}
                >
                  <option value="pt-BR">{t("localePtBr")}</option>
                  <option value="en-US">{t("localeEnUs")}</option>
                  <option value="es-ES">{t("localeEsEs")}</option>
                </select>
              </FormFieldShell>

              <FormFieldShell
                icon={<CircleDollarSign aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("currency")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={partner.currency}
                  name="currency"
                  onChange={(event) => setCurrency(event.target.value as PartnerRecord["currency"])}
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </FormFieldShell>

              <FormFieldShell
                icon={<UserRound aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("teachingMode")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={partner.teaching_mode ?? ""}
                  name="teaching_mode"
                  onChange={(event) => setTeachingMode((event.target.value || null) as PartnerRecord["teaching_mode"])}
                >
                  <option value="">{t("notSet")}</option>
                  <option value="individual">{t("teachingModeIndividual")}</option>
                  <option value="group">{t("teachingModeGroup")}</option>
                  <option value="both">{t("teachingModeBoth")}</option>
                </select>
              </FormFieldShell>

              <FormFieldShell
                icon={<MonitorPlay aria-hidden="true" className="h-4 w-4 text-[var(--brand-blue)]" />}
                label={t("classMode")}
              >
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={partner.class_mode ?? ""}
                  name="class_mode"
                  onChange={(event) => setClassMode((event.target.value || null) as PartnerRecord["class_mode"])}
                >
                  <option value="">{t("notSet")}</option>
                  <option value="online">{t("classModeOnline")}</option>
                  <option value="in_person">{t("classModeInPerson")}</option>
                  <option value="both">{t("classModeBoth")}</option>
                </select>
              </FormFieldShell>
            </div>
          </section>
        </div>

        <aside className="space-y-4 2xl:sticky 2xl:top-6 2xl:self-start">
          <section className="panel-soft rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-blue)]">
              {t("preferencesTitle")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </section>

          <section className="section-shell rounded-[30px] p-6">
            <div className="space-y-4">
              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("displayName")}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--brand-navy)]">
                  {displayName || t("displayName")}
                </p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("locale")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {getLocaleLabel(locale, t)}
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
                  {t("timezone")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">{timezone}</p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("teachingMode")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {getTeachingModeLabel(teachingMode, t)}
                </p>
              </div>

              <div className={insetCardStyles()}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("classMode")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">
                  {getClassModeLabel(classMode, t)}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <ActionFeedback message={state.error} tone="error" />

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
