export type AppRole = "god" | "teacher_admin" | "student";

export type ProfileLocale = "pt-BR" | "en-US" | "es-ES";

export type AppProfileRecord = {
  avatar_url: string | null;
  email: string;
  full_name: string;
  id: string;
  locale: ProfileLocale;
  phone: string | null;
  role: AppRole;
};

export type AppPartnerSummary = {
  currency: "BRL" | "USD" | "EUR";
  display_name: string;
  onboarding_completed_at: string | null;
  partner_id: string;
  timezone: string;
  user_id: string;
};

export type CurrentAppProfile = {
  partner: AppPartnerSummary | null;
  profile: AppProfileRecord;
};
