"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { startTransition } from "react";

import { locales } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
      {locales.map((item) => {
        const active = item === locale;

        return (
          <button
            key={item}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-white text-slate-900"
                : "text-white/72 hover:text-white",
            ].join(" ")}
            onClick={() => {
              const nextPath = pathname.replace(`/${locale}`, `/${item}`);
              startTransition(() => router.replace(nextPath));
            }}
            type="button"
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
