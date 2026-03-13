"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { ActionFeedback } from "@/components/shared/action-feedback";

type AuthFormProps = {
  action: (
    state: { error?: string; success?: string },
    formData: FormData,
  ) => Promise<{ error?: string; success?: string }>;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  externalError?: string;
  hidePasswordLabel: string;
  loadingLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPasswordLabel: string;
  socialAuth?: React.ReactNode;
  socialDividerLabel?: string;
  submitLabel: string;
  title: string;
};

type AuthFormState = {
  error?: string;
  success?: string;
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f2341_0%,#173f73_52%,#ff6f61_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,35,65,0.22)] transition hover:translate-y-[-1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <span>{pending ? pendingLabel : label}</span>
      <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
    </button>
  );
}

const initialState: AuthFormState = {};

export function AuthForm({
  action,
  alternateHref,
  alternateLabel,
  alternateText,
  description,
  emailLabel,
  emailPlaceholder,
  externalError,
  hidePasswordLabel,
  loadingLabel,
  passwordLabel,
  passwordPlaceholder,
  showPasswordLabel,
  socialAuth,
  socialDividerLabel,
  submitLabel,
  title,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const emailFieldId = "auth-email";
  const passwordFieldId = "auth-password";

  return (
    <div className="panel-soft w-full max-w-[540px] rounded-[36px] p-3 shadow-[0_34px_90px_rgba(15,35,65,0.14)]">
      <div className="rounded-[30px] border border-white/70 bg-white/86 p-8 backdrop-blur md:p-9">
        <div className="mb-8 space-y-3">
          <h1 className="font-display text-4xl font-bold tracking-[-0.05em] text-[var(--brand-navy)]">
            {title}
          </h1>
          <p className="max-w-md text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <ActionFeedback className="mb-4" message={externalError} tone="error" />

        {socialAuth ? (
          <div className="space-y-5">
            {socialAuth}

            {socialDividerLabel ? (
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(15,35,65,0.02),rgba(15,35,65,0.18))]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {socialDividerLabel}
                </span>
                <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(15,35,65,0.18),rgba(15,35,65,0.02))]" />
              </div>
            ) : null}
          </div>
        ) : null}

        <form action={formAction} className="mt-6 space-y-5">
          <div className="block space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor={emailFieldId}>
              {emailLabel}
            </label>
            <span className="group flex h-14 items-center rounded-[22px] border border-[rgba(23,63,115,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.92))] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus-within:border-[rgba(255,111,97,0.42)] focus-within:ring-4 focus-within:ring-[rgba(255,111,97,0.12)]">
              <Mail aria-hidden="true" className="h-4 w-4 text-slate-400 transition group-focus-within:text-[var(--brand-accent)]" />
              <input
                className="h-full w-full bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                id={emailFieldId}
                name="email"
                placeholder={emailPlaceholder}
                required
                type="email"
              />
            </span>
          </div>

          <div className="block space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor={passwordFieldId}>
              {passwordLabel}
            </label>
            <span className="group flex h-14 items-center rounded-[22px] border border-[rgba(23,63,115,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,252,0.92))] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus-within:border-[rgba(255,111,97,0.42)] focus-within:ring-4 focus-within:ring-[rgba(255,111,97,0.12)]">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 text-slate-400 transition group-focus-within:text-[var(--brand-accent)]" />
              <input
                className="h-full w-full bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                id={passwordFieldId}
                minLength={8}
                name="password"
                placeholder={passwordPlaceholder}
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[var(--brand-accent)]"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Eye aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            </span>
          </div>

          <ActionFeedback message={state.error} tone="error" />
          <ActionFeedback message={state.success} tone="success" />

          <SubmitButton label={submitLabel} pendingLabel={loadingLabel} />
        </form>

        <p className="mt-6 text-sm text-slate-500">
          {alternateText}{" "}
          <Link className="font-semibold text-[var(--brand-blue)] hover:text-[var(--brand-accent)]" href={alternateHref}>
            {alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
