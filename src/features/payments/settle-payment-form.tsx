"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { ActionFeedback } from "@/components/shared/action-feedback";
import { buttonStyles, fieldStyles } from "@/components/shared/ui-primitives";
import type { PaymentMethod } from "@/types/payment";
import type { SettlePaymentActionState } from "@/features/payments/actions";

type SettlePaymentFormProps = {
  action: (
    state: SettlePaymentActionState,
    formData: FormData,
  ) => Promise<SettlePaymentActionState>;
  className: string;
  methodOptions: Array<{ label: string; value: PaymentMethod }>;
  submitLabel: string;
};

const initialState: SettlePaymentActionState = {};

function SubmitButton({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} type="submit">
      {label}
    </button>
  );
}

export function SettlePaymentForm({
  action,
  className,
  methodOptions,
  submitLabel,
}: SettlePaymentFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  return (
    <div className="space-y-2">
      <form action={formAction} className={className}>
        <select
          className={fieldStyles({ control: "select" })}
          defaultValue="pix"
          name="method"
        >
          {methodOptions.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
        <SubmitButton
          className={buttonStyles({ variant: "primary" })}
          label={submitLabel}
        />
      </form>

      <ActionFeedback message={state.error} tone="error" />
    </div>
  );
}
