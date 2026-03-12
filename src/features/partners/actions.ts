"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getPartnerContext } from "@/lib/auth/partner";
import { createRequestId, logServerError, logServerEvent } from "@/lib/observability/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parsePartnerFormData } from "@/features/partners/validators";

export type PartnerActionState = {
  error?: string;
};

async function getPartnerMessages(locale: string) {
  const t = await getTranslations({ locale, namespace: "PartnerForm" });

  return {
    errorDisplayName: t("errorDisplayName"),
    errorSave: t("errorSave"),
    errorTimezone: t("errorTimezone"),
    validationInvalid: t("validationInvalid"),
  };
}

function getPartnerValidationMessage(
  messages: Awaited<ReturnType<typeof getPartnerMessages>>,
  field?: string,
) {
  switch (field) {
    case "display_name":
      return messages.errorDisplayName;
    case "timezone":
      return messages.errorTimezone;
    default:
      return messages.validationInvalid;
  }
}

export async function completeOnboardingAction(
  locale: string,
  _prevState: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  const requestId = createRequestId();
  const messages = await getPartnerMessages(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = parsePartnerFormData(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        field: String(parsed.error.issues[0]?.path[0] ?? ""),
        locale,
      },
      event: "onboarding_validation_failed",
      level: "warn",
      requestId,
      scope: "partners.actions",
    });
    return {
      error: getPartnerValidationMessage(messages, String(parsed.error.issues[0]?.path[0] ?? "")),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("partners")
    .update({
      ...parsed.data,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("partner_id", partner.partnerId);

  if (error) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
      },
      error,
      event: "onboarding_update_failed",
      requestId,
      scope: "partners.actions",
    });
    return { error: messages.errorSave };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
    },
    event: "onboarding_completed",
    requestId,
    scope: "partners.actions",
  });

  revalidatePath(`/${locale}/onboarding`);
  revalidatePath(`/${locale}/app`);
  revalidatePath(`/${locale}/settings`);
  redirect(`/${locale}/app`);
}

export async function updatePartnerSettingsAction(
  locale: string,
  _prevState: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  const requestId = createRequestId();
  const messages = await getPartnerMessages(locale);
  const partner = await getPartnerContext();

  if (!partner) {
    redirect(`/${locale}/login`);
  }

  const parsed = parsePartnerFormData(formData);

  if (!parsed.success) {
    logServerEvent({
      data: {
        field: String(parsed.error.issues[0]?.path[0] ?? ""),
        locale,
      },
      event: "partner_settings_validation_failed",
      level: "warn",
      requestId,
      scope: "partners.actions",
    });
    return {
      error: getPartnerValidationMessage(messages, String(parsed.error.issues[0]?.path[0] ?? "")),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("partners")
    .update(parsed.data)
    .eq("partner_id", partner.partnerId);

  if (error) {
    logServerError({
      data: {
        locale,
        partnerId: partner.partnerId,
      },
      error,
      event: "partner_settings_update_failed",
      requestId,
      scope: "partners.actions",
    });
    return { error: messages.errorSave };
  }

  logServerEvent({
    data: {
      locale,
      partnerId: partner.partnerId,
    },
    event: "partner_settings_updated",
    requestId,
    scope: "partners.actions",
  });

  revalidatePath(`/${locale}/settings`);
  revalidatePath(`/${locale}/app`);
  revalidatePath(`/${locale}/agenda`);
  revalidatePath(`/${locale}/payments`);
  redirect(`/${locale}/settings`);
}
