import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthForm } from "@/features/auth/auth-form";
import { GoogleAuthButton } from "@/features/auth/google-auth-button";
import { signUpAction } from "@/features/auth/actions";
import { isGoogleOAuthConfigured, isSupabaseBrowserAuthConfigured } from "@/features/auth/oauth";

type SignupPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("Auth");
  const signUp = signUpAction.bind(null, locale);
  const googleEnabled = isGoogleOAuthConfigured() && isSupabaseBrowserAuthConfigured();

  return (
    <div className="w-full">
      <AuthForm
        action={signUp}
        alternateHref={`/${locale}/login`}
        alternateLabel={t("loginLink")}
        alternateText={t("loginPrompt")}
        description={t("signupDescription")}
        emailLabel={t("emailLabel")}
        emailPlaceholder={t("emailPlaceholder")}
        hidePasswordLabel={t("hidePassword")}
        loadingLabel={t("loading")}
        passwordLabel={t("passwordLabel")}
        passwordPlaceholder={t("passwordPlaceholder")}
        showPasswordLabel={t("showPassword")}
        socialAuth={
          <GoogleAuthButton
            configured={googleEnabled}
            label={t("google")}
            locale={locale}
            unavailableLabel={t("googleUnavailable")}
          />
        }
        socialDividerLabel={t("socialDivider")}
        submitLabel={t("signupSubmit")}
        title={t("signupTitle")}
      />
    </div>
  );
}
