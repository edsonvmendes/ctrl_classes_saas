import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthForm } from "@/features/auth/auth-form";
import { GoogleAuthButton } from "@/features/auth/google-auth-button";
import { signInAction } from "@/features/auth/actions";
import { isGoogleOAuthConfigured, isSupabaseBrowserAuthConfigured } from "@/features/auth/oauth";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const { error } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations("Auth");
  const signIn = signInAction.bind(null, locale);
  const googleEnabled = isGoogleOAuthConfigured() && isSupabaseBrowserAuthConfigured();

  return (
    <div className="w-full">
      <AuthForm
        action={signIn}
        alternateHref={`/${locale}/signup`}
        alternateLabel={t("signupLink")}
        alternateText={t("signupPrompt")}
        description={t("loginDescription")}
        emailLabel={t("emailLabel")}
        emailPlaceholder={t("emailPlaceholder")}
        externalError={error}
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
        submitLabel={t("loginSubmit")}
        title={t("loginTitle")}
      />
    </div>
  );
}
