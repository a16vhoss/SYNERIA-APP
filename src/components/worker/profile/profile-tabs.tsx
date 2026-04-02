"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type ProfileTabId =
  | "info"
  | "experiencia"
  | "educacion"
  | "documentos"
  | "portfolio"
  | "recomendaciones"
  | "configuracion";

interface Tab {
  id: ProfileTabId;
  label: string;
}

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");

  const TABS: Tab[] = [
    { id: "info", label: t("profile.tabs.personal") },
    { id: "experiencia", label: t("profile.tabs.experience") },
    { id: "educacion", label: t("profile.tabs.education") },
    { id: "documentos", label: t("profile.tabs.documents") },
    { id: "portfolio", label: t("profile.tabs.portfolio") },
    { id: "recomendaciones", label: t("profile.tabs.recommendations") },
    { id: "configuracion", label: tc("nav.settings") },
  ];
  return (
    <div className="relative border-b border-border">
      <nav className="-mb-px flex gap-6 overflow-x-auto px-1" aria-label="Tabs de perfil">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative whitespace-nowrap pb-3 pt-1 text-sm font-medium transition-colors",
                isActive
                  ? "text-brand-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}

              {/* Animated underline */}
              {isActive && (
                <motion.div
                  layoutId="profile-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
