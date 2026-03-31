"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Search,
  Wallet,
  FileCheck,
  ShieldCheck,
  Languages,
  Globe2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { useTranslations } from "next-intl";

const featureKeys = [
  { icon: Search, key: "smartSearch", gradient: "from-brand-500 to-brand-600" },
  { icon: Wallet, key: "wallet", gradient: "from-brand-400 to-brand-600" },
  { icon: FileCheck, key: "contracts", gradient: "from-brand-600 to-brand-700" },
  { icon: ShieldCheck, key: "documents", gradient: "from-brand-500 to-brand-700" },
  { icon: Languages, key: "multilingual", gradient: "from-brand-400 to-brand-500" },
  { icon: Globe2, key: "network", gradient: "from-brand-600 to-brand-800" },
] as const;

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const t = useTranslations("common.landing.features");

  return (
    <section
      id="plataforma"
      ref={sectionRef}
      className="relative bg-cream-light py-20 sm:py-28 overflow-hidden"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-brand-100/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] rounded-full bg-brand-50/40 blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-4">
            {t("badge")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <GlassCard className="h-full p-6 sm:p-7 group hover:border-brand-200/50 transition-colors duration-300">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg shadow-brand-600/15 group-hover:shadow-brand-600/25 transition-shadow duration-300`}
                  >
                    <Icon className="size-5 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-brand-900 mb-2">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`${feature.key}.description`)}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
