"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function CtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const t = useTranslations("common.landing.cta");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700"
        style={{ y: bgY }}
      />

      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-400/8 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center"
        style={{ y: textY }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-8"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-400" />
          </span>
          <span className="text-sm font-medium text-brand-100">
            {t("badge")}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
        >
          {t("title")}{" "}
          <span className="relative">
            {t("titleHighlight")}
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ originX: 0 }}
            />
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-brand-200/80 max-w-2xl mx-auto mb-10"
        >
          {t("subtitle")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-brand-800 font-semibold text-base hover:bg-brand-50 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 active:scale-[0.97]"
          >
            {t("createAccount")}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/50 transition-all duration-300 active:scale-[0.97]"
          >
            <Building2 className="size-4" />
            {t("iAmCompany")}
          </Link>
        </motion.div>

        {/* Trust elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-brand-300/50 text-xs uppercase tracking-wider font-medium"
        >
          <span>{t("noCreditCard")}</span>
          <span className="w-1 h-1 rounded-full bg-brand-400/30" />
          <span>{t("registerIn2Min")}</span>
          <span className="w-1 h-1 rounded-full bg-brand-400/30" />
          <span>{t("support6Languages")}</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
