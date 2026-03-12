"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { ActionFeedback } from "@/components/shared/action-feedback";
import { buttonStyles } from "@/components/shared/ui-primitives";
import type { GeneratePaymentsActionState } from "@/features/payments/actions";

type GeneratePaymentsFormProps = {
  action: (
    state: GeneratePaymentsActionState,
    formData: FormData,
  ) => Promise<GeneratePaymentsActionState>;
  submitLabel: string;
};

const initialState: GeneratePaymentsActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={buttonStyles({ size: "lg", variant: "primary" })}
      disabled={pending}
      type="submit"
    >
      {label}
    </button>
  );
}

export function GeneratePaymentsForm({
  action,
  submitLabel,
}: GeneratePaymentsFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <SubmitButton label={submitLabel} />
      </form>

      <ActionFeedback message={state.error} tone="error" />
    </div>
  );
}
