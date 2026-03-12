"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  CalendarClock,
  Clock3,
  NotebookPen,
  Repeat2,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ActionFeedback } from "@/components/shared/action-feedback";
import { CardLabel } from "@/components/shared/card-label";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonStyles, fieldStyles, insetCardStyles } from "@/components/shared/ui-primitives";
import { toTimeInputValue } from "@/lib/datetime/time-input";

type ScheduleActionState = {
  error?: string;
};

type StudentOption = {
  id: string;
  full_name: string;
};

type ScheduleInitialValues = {
  by_weekday: number[];
  duration_minutes: number;
  end_date: string | null;
  notes: string | null;
  start_date: string;
  starts_at_time: string;
  status: "active" | "paused" | "ended";
  student_id: string | null;
  subject: string | null;
  timezone: string;
  title: string;
};

type ScheduleFormProps = {
  action: (
    state: ScheduleActionState,
    formData: FormData,
  ) => Promise<ScheduleActionState>;
  cancelHref: string;
  defaultTimezone: string;
  initialValues?: ScheduleInitialValues;
  mode?: "create" | "edit";
  students: StudentOption[];
};

const initialState: ScheduleActionState = {};
const weekdays = [0, 1, 2, 3, 4, 5, 6] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Schedules");

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

export function ScheduleForm({
  action,
  cancelHref,
  students,
  defaultTimezone,
  initialValues,
  mode = "create",
}: ScheduleFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const t = useTranslations("Schedules");
  const title = mode === "edit" ? t("editTitle") : t("newTitle");
  const submitLabel = mode === "edit" ? t("saveChanges") : t("save");

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="panel-soft rounded-[34px] p-8">
            <SectionHeading
              description={t("formDescription")}
              icon={UserRound}
              title={title}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">{t("titleLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={initialValues?.title ?? ""}
                  name="title"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("subjectLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={initialValues?.subject ?? ""}
                  name="subject"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("studentLabel")}</span>
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={initialValues?.student_id ?? ""}
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
                <span className="text-sm font-semibold text-slate-700">{t("timezoneLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={initialValues?.timezone ?? defaultTimezone}
                  name="timezone"
                  required
                />
              </label>
            </div>
          </section>

          <section className="section-shell rounded-[34px] p-8">
            <SectionHeading
              description={t("upcomingTitle")}
              icon={CalendarClock}
              title={t("startTimeLabel")}
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("startTimeLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={toTimeInputValue(initialValues?.starts_at_time)}
                  name="starts_at_time"
                  required
                  step="60"
                  type="time"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("durationLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={initialValues?.duration_minutes ?? 60}
                  max="600"
                  min="15"
                  name="duration_minutes"
                  required
                  type="number"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("startDateLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={initialValues?.start_date ?? ""}
                  name="start_date"
                  required
                  type="date"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("endDateLabel")}</span>
                <input
                  className={fieldStyles()}
                  defaultValue={initialValues?.end_date ?? ""}
                  name="end_date"
                  type="date"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("statusLabel")}</span>
                <select
                  className={fieldStyles({ control: "select" })}
                  defaultValue={initialValues?.status ?? "active"}
                  name="status"
                >
                  <option value="active">{t("statusActive")}</option>
                  <option value="paused">{t("statusPaused")}</option>
                  <option value="ended">{t("statusEnded")}</option>
                </select>
              </label>
            </div>
          </section>

          <section className="section-shell rounded-[34px] p-8">
            <SectionHeading
              description={t("notesLabel")}
              icon={Repeat2}
              title={t("weekdaysLabel")}
            />

            <div className="mt-8 grid gap-6">
              <div className="space-y-3">
                <span className="text-sm font-semibold text-slate-700">{t("weekdaysLabel")}</span>
                <div className="flex flex-wrap gap-3">
                  {weekdays.map((weekday) => (
                    <label
                      key={weekday}
                      className={`${insetCardStyles()} inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700`}
                    >
                      <input
                        defaultChecked={initialValues?.by_weekday.includes(weekday)}
                        name="by_weekday"
                        type="checkbox"
                        value={weekday}
                      />
                      <span>{t(`weekday${weekday}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t("notesLabel")}</span>
                <textarea
                  className={fieldStyles({ control: "textarea" })}
                  defaultValue={initialValues?.notes ?? ""}
                  name="notes"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="panel-soft rounded-[30px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-blue)]">
              {mode === "edit" ? t("editTitle") : t("newTitle")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t("formDescription")}</p>
          </section>

          <section className="section-shell rounded-[30px] p-6">
            <div className="space-y-4">
              <div className={insetCardStyles()}>
                <CardLabel icon={Clock3}>{t("timezoneLabel")}</CardLabel>
                <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">
                  {initialValues?.timezone ?? defaultTimezone}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <CardLabel icon={Sparkles}>{t("statusLabel")}</CardLabel>
                <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">
                  {initialValues?.status === "paused"
                    ? t("statusPaused")
                    : initialValues?.status === "ended"
                      ? t("statusEnded")
                      : t("statusActive")}
                </p>
              </div>
              <div className={insetCardStyles()}>
                <CardLabel icon={NotebookPen}>{t("weekdaysLabel")}</CardLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(initialValues?.by_weekday ?? []).length > 0 ? (
                    (initialValues?.by_weekday ?? []).map((weekday) => (
                      <span
                        className="rounded-full border border-[rgba(23,63,115,0.1)] bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700"
                        key={weekday}
                      >
                        {t(`weekday${weekday}`)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">-</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <ActionFeedback message={state.error} tone="error" />

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
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
