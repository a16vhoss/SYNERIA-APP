"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DashboardTabs() {
  const t = useTranslations("worker");
  const pathname = usePathname();

  const TABS = [
    { label: t("dashboard.tabs.panel"), href: "/dashboard" },
    { label: t("dashboard.tabs.searchJobs"), href: "/jobs" },
    { label: t("dashboard.tabs.myApplications"), href: "/applications" },
  ] as const;

  // Determine active tab – default to "Panel" when on /dashboard
  const activeHref =
    TABS.find((t) => pathname.startsWith(t.href))?.href ?? "/dashboard";

  return (
    <motion.nav
      className="inline-flex items-center gap-1 rounded-full bg-cream-dark/60 p-1 ring-1 ring-foreground/5"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      {TABS.map((tab) => {
        const isActive = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="dashboard-tab-pill"
                className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-foreground/5"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
