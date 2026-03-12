"use server";

import { redirect } from "next/navigation";

import {
  getGoogleOAuthRedirectTo,
  getGoogleOAuthStartErrorPath,
  getGoogleOAuthUnavailablePath,
  isGoogleOAuthConfigured,
} from "@/features/auth/oauth";
import { getPostAuthPath } from "@/features/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function signInAction(
  locale: string,
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(
    await getPostAuthPath(
      locale,
      supabase as unknown as Parameters<typeof getPostAuthPath>[1],
    ),
  );
}

export async function signUpAction(
  locale: string,
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getGoogleOAuthRedirectTo(locale),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Account created. Check your email to confirm access." };
}

export async function signInWithGoogleAction(locale: string) {
  if (!isGoogleOAuthConfigured()) {
    redirect(getGoogleOAuthUnavailablePath(locale));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getGoogleOAuthRedirectTo(locale),
    },
  });

  if (error) {
    redirect(getGoogleOAuthStartErrorPath(locale, error.message));
  }

  if (!data.url) {
    redirect(getGoogleOAuthStartErrorPath(locale));
  }

  redirect(data.url);
}

export async function signOutAction(locale: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect(`/${locale}/login`);
}
