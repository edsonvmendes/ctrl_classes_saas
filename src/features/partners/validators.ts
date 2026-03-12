import { z } from "zod";

const optionalText = z.string().trim().transform((value) => value || null);

export const partnerFormSchema = z.object({
  class_mode: z.enum(["online", "in_person", "both"]).nullable(),
  currency: z.enum(["BRL", "USD", "EUR"]),
  display_name: z.string().trim().min(2, "Display name must have at least 2 characters."),
  legal_name: optionalText,
  locale: z.enum(["pt-BR", "en-US", "es-ES"]),
  phone: optionalText,
  teaching_mode: z.enum(["individual", "group", "both"]).nullable(),
  timezone: z.string().trim().min(3, "Timezone is required."),
});

export function parsePartnerFormData(formData: FormData) {
  return partnerFormSchema.safeParse({
    class_mode: (String(formData.get("class_mode") ?? "") || null) as
      | "online"
      | "in_person"
      | "both"
      | null,
    currency: String(formData.get("currency") ?? "BRL"),
    display_name: String(formData.get("display_name") ?? ""),
    legal_name: String(formData.get("legal_name") ?? ""),
    locale: String(formData.get("locale") ?? "pt-BR"),
    phone: String(formData.get("phone") ?? ""),
    teaching_mode: (String(formData.get("teaching_mode") ?? "") || null) as
      | "individual"
      | "group"
      | "both"
      | null,
    timezone: String(formData.get("timezone") ?? ""),
  });
}
