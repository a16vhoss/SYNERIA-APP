"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ProfileTabId =
  | "info"
  | "experiencia"
  | "educacion"
  | "documentos"
  | "configuracion";

interface Tab {
  id: ProfileTabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "info", label: "Informacion Personal" },
  { id: "experiencia", label: "Experiencia" },
  { id: "educacion", label: "Educacion" },
  { id: "documentos", label: "Documentos" },
  { id: "configuracion", label: "Configuracion" },
];

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
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
