function getLocalizedOAuthMessage(locale: string, type: "start" | "unavailable") {
  if (locale === "en-US") {
    return type === "unavailable"
      ? "Google sign-in is not available in this environment yet."
      : "We could not start Google sign-in right now.";
  }

  if (locale === "es-ES") {
    return type === "unavailable"
      ? "El acceso con Google todavía no está disponible en este entorno."
      : "No pudimos iniciar el acceso con Google ahora.";
  }

  return type === "unavailable"
    ? "O acesso com Google ainda não está disponível neste ambiente."
    : "Não foi possível iniciar o acesso com Google agora.";
}

export function isGoogleOAuthConfigured(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(
    env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID && env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET,
  );
}

export function isSupabaseBrowserAuthConfigured(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getGoogleOAuthRedirectTo(
  locale: string,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
) {
  return `${appUrl}/auth/callback?locale=${locale}`;
}

export function getGoogleOAuthUnavailablePath(locale: string) {
  return `/${locale}/login?error=${encodeURIComponent(getLocalizedOAuthMessage(locale, "unavailable"))}`;
}

export function getGoogleOAuthStartErrorPath(locale: string, message?: string) {
  return `/${locale}/login?error=${encodeURIComponent(message ?? getLocalizedOAuthMessage(locale, "start"))}`;
}
