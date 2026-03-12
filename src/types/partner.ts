export type PartnerLocale = "pt-BR" | "en-US" | "es-ES";
export type PartnerCurrency = "BRL" | "USD" | "EUR";
export type TeachingMode = "individual" | "group" | "both";
export type ClassMode = "online" | "in_person" | "both";

export type PartnerRecord = {
  partner_id: string;
  user_id: string;
  display_name: string;
  legal_name: string | null;
  phone: string | null;
  locale: PartnerLocale;
  timezone: string;
  currency: PartnerCurrency;
  teaching_mode: TeachingMode | null;
  class_mode: ClassMode | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
