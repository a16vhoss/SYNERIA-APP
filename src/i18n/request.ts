import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

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
