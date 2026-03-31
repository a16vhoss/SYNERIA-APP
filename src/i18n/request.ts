import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Read locale from NEXT_LOCALE cookie if not set by middleware
  if (!locale) {
    const cookieStore = await cookies();
    locale = cookieStore.get("NEXT_LOCALE")?.value;
  }

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const [common, auth, worker, employer] = await Promise.all([
    import(`./locales/${locale}/common.json`).then((m) => m.default),
    import(`./locales/${locale}/auth.json`).then((m) => m.default),
    import(`./locales/${locale}/worker.json`).then((m) => m.default),
    import(`./locales/${locale}/employer.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      auth,
      worker,
      employer,
    },
  };
});
