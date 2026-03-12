"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { ActionFeedback } from "@/components/shared/action-feedback";

type ManualClassActionState = {
  error?: string;
};

type StudentOption = {
  id: string;
  full_name: string;
};

type ManualClassFormProps = {
  action: (
    state: ManualClassActionState,
    formData: FormData,
  ) => Promise<ManualClassActionState>;
  cancelHref: string;
  defaultDate: string;
  defaultTimezone: string;
  students: StudentOption[];
};

const initialState: ManualClassActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Agenda");

  return (
    <button
      className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand-blue)] px-6 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? t("saving") : t("createManualClassSubmit")}
    </button>
  );
}

export function ManualClassForm({
  action,
  cancelHref,
  defaultDate,
  defaultTimezone,
  students,
}: ManualClassFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const t = useTranslations("Agenda");

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--brand-navy)]">
            {t("createManualClassTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {t("createManualClassDescription")}
          </p>
        </div>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">{t("titleLabel")}</span>
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            name="title"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("subjectLabel")}</span>
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            name="subject"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("studentLabel")}</span>
          <select
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            defaultValue=""
            name="student_id"
          >
            <option value="">{t("studentNone")}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("classDateLabel")}</span>
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            defaultValue={defaultDate}
            name="class_date"
            required
            type="date"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("startTimeLabel")}</span>
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            name="starts_at_time"
            required
            step="60"
            type="time"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("durationLabel")}</span>
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            defaultValue={60}
            max="600"
            min="15"
            name="duration_minutes"
            required
            type="number"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("timezone")}</span>
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            defaultValue={defaultTimezone}
            name="timezone"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">{t("notesLabel")}</span>
          <textarea
            className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            name="notes"
          />
        </label>
      </section>

      <ActionFeedback message={state.error} tone="error" />

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        <Link
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          href={cancelHref}
        >
          {t("back")}
        </Link>
      </div>
    </form>
  );
}
