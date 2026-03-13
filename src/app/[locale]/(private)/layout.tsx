import { getTranslations } from "next-intl/server";

import { PrivateMobileNav } from "@/components/shared/private-mobile-nav";
import { PrivateSidebar } from "@/components/shared/private-sidebar";
import { PrivateShellHeader } from "@/components/shared/private-shell-header";
import { type NavItem } from "@/components/shared/private-nav-state";
import { signOutAction } from "@/features/auth/actions";
import { requireTeacherAdmin } from "@/lib/auth/profile";

type PrivateLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PrivateLayout({
  children,
  params,
}: PrivateLayoutProps) {
  const { locale } = await params;
  const currentProfile = await requireTeacherAdmin(locale);
  const t = await getTranslations("PrivateNav");

  const signOut = signOutAction.bind(null, locale);
  const navItems: NavItem[] = [
    {
      description: t("appDescription"),
      href: `/${locale}/app`,
      icon: "app",
      label: t("app"),
      shortLabel: t("app"),
    },
    {
      description: t("studentsDescription"),
      href: `/${locale}/students`,
      icon: "students",
      label: t("students"),
      shortLabel: t("students"),
    },
    {
      description: t("agendaDescription"),
      href: `/${locale}/agenda`,
      icon: "agenda",
      label: t("agenda"),
      shortLabel: t("agenda"),
    },
    {
      description: t("schedulesDescription"),
      href: `/${locale}/schedules`,
      icon: "schedules",
      label: t("schedules"),
      shortLabel: t("schedules"),
    },
    {
      description: t("paymentsDescription"),
      href: `/${locale}/payments`,
      icon: "payments",
      label: t("payments"),
      shortLabel: t("payments"),
    },
    {
      description: t("settingsDescription"),
      href: `/${locale}/settings`,
      icon: "settings",
      label: t("settings"),
      shortLabel: t("settings"),
    },
    {
      description: t("onboardingDescription"),
      href: `/${locale}/onboarding`,
      icon: "onboarding",
      label: t("onboarding"),
      shortLabel: t("onboarding"),
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-app-ambient" />
      <div className="pointer-events-none absolute inset-0 texture-grid opacity-20" />
      <div className="relative mx-auto flex min-h-screen max-w-[1480px] gap-6 px-4 py-4 md:px-6 md:py-6">
        <PrivateSidebar
          activeSectionLabel={t("activeSection")}
          collapseLabel={t("collapseShell")}
          expandLabel={t("expandShell")}
          items={navItems}
          settingsHref={`/${locale}/settings`}
          settingsLabel={t("settings")}
          shortcutLabel={t("shortcut")}
          workspaceLabel={t("workspace")}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6 pb-24 lg:pb-0">
          <PrivateShellHeader
            activeSectionLabel={t("activeSection")}
            items={navItems}
            settingsHref={`/${locale}/settings`}
            settingsLabel={t("settings")}
            signOutAction={signOut}
            signOutLabel={t("signOut")}
            userEmail={currentProfile.profile.email}
            workspaceLabel={t("workspace")}
          />

          <section className="flex-1 pb-2">{children}</section>
        </div>
      </div>
      <PrivateMobileNav items={navItems} />
    </main>
  );
}
