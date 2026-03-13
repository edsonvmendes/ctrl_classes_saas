import { getTranslations } from "next-intl/server";

import { signOutAction } from "@/features/auth/actions";
import { GodMobileNav } from "@/features/god/god-mobile-nav";
import { GodShellHeader } from "@/features/god/god-shell-header";
import { GodSidebar } from "@/features/god/god-sidebar";
import { type GodNavItem } from "@/features/god/god-nav-state";
import { requireGod } from "@/lib/auth/profile";

type GodLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function GodLayout({ children, params }: GodLayoutProps) {
  const { locale } = await params;
  const currentProfile = await requireGod(locale);
  const t = await getTranslations("GodNav");
  const signOut = signOutAction.bind(null, locale);

  const items: GodNavItem[] = [
    {
      description: t("overviewDescription"),
      href: `/${locale}/god`,
      icon: "overview",
      label: t("overview"),
      shortLabel: t("overviewShort"),
    },
    {
      description: t("tenantsDescription"),
      href: `/${locale}/god/tenants`,
      icon: "tenants",
      label: t("tenants"),
      shortLabel: t("tenantsShort"),
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#08111f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,111,97,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_22%),linear-gradient(180deg,#08111f_0%,#0b1526_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-position:center_center] [background-size:36px_36px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1560px] gap-6 px-4 py-4 md:px-6 md:py-6">
        <GodSidebar
          items={items}
          missionDescription={t("missionDescription")}
          missionTitle={t("missionTitle")}
          workspaceLabel={t("workspace")}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6 pb-24 lg:pb-0">
          <GodShellHeader
            items={items}
            signOutAction={signOut}
            signOutLabel={t("signOut")}
            userEmail={currentProfile.profile.email}
            workspaceLabel={t("workspace")}
          />

          <section className="flex-1 pb-2">{children}</section>
        </div>
      </div>

      <GodMobileNav items={items} />
    </main>
  );
}
