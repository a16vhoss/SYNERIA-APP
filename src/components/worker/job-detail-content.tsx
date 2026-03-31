"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "descripcion", label: "Descripcion" },
  { id: "responsabilidades", label: "Responsabilidades" },
  { id: "requisitos", label: "Requisitos" },
  { id: "beneficios", label: "Beneficios" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface JobDetailContentProps {
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  className?: string;
}

export function JobDetailContent({
  description,
  responsibilities,
  requirements,
  benefits,
  className,
}: JobDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("descripcion");

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-foreground/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-brand-600"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600"
                layoutId="job-tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="min-h-[200px]"
        >
          {activeTab === "descripcion" && (
            <div className="space-y-4">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Descripcion del Puesto
              </h3>
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description}
              </div>
            </div>
          )}

          {activeTab === "responsabilidades" && (
            <div className="space-y-4">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Responsabilidades
              </h3>
              <ul className="space-y-2.5">
                {responsibilities.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "requisitos" && (
            <div className="space-y-4">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Requisitos
              </h3>
              <ul className="space-y-2.5">
                {requirements.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "beneficios" && (
            <div className="space-y-4">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Beneficios
              </h3>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
