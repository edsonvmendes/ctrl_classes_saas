import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "@/i18n/routing";

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix: "always",
});

export const config = {
  matcher: ["/", "/(pt-BR|en-US|es-ES)/:path*"],
};
