"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const WORD_KEYS = [
  "professionals",
  "opportunities",
  "companies",
  "talent",
] as const;

function FloatingShape({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.15, 0.3, 0.15],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function AnimatedLeftPanel() {
  const t = useTranslations("auth");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORD_KEYS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-8 lg:p-12"
    >
      {/* Floating decorative shapes */}
      <FloatingShape
        className="absolute right-12 top-20 size-32 rounded-full bg-white/5"
        delay={0}
      />
      <FloatingShape
        className="absolute -left-8 top-1/3 size-24 rounded-full bg-brand-500/10"
        delay={1.2}
      />
      <FloatingShape
        className="absolute bottom-32 right-8 size-16 rounded-full bg-white/5"
        delay={0.6}
      />
      <FloatingShape
        className="absolute bottom-48 left-16 size-8 rounded-full bg-brand-400/15"
        delay={2}
      />

      {/* Dot grid decoration */}
      <div className="absolute right-6 top-1/4 grid grid-cols-4 gap-2 opacity-20">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="size-1.5 rounded-full bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 2.5,
              delay: i * 0.1,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Top content */}
      <div className="relative z-10 space-y-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm font-medium uppercase tracking-widest text-brand-300"
        >
          {t("leftPanel.tagline")}
        </motion.p>

        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-heading text-4xl font-bold leading-tight text-white lg:text-5xl"
          >
            {t("leftPanel.connectWith")}
          </motion.h1>

          {/* Rotating word */}
          <div className="h-14 lg:h-16">
            <AnimatePresence mode="wait">
              <motion.span
                key={WORD_KEYS[wordIndex]}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="block font-heading text-4xl font-bold text-brand-300 lg:text-5xl"
              >
                {t(`leftPanel.words.${WORD_KEYS[wordIndex]}`)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-md text-sm leading-relaxed text-white/70"
        >
          {t("leftPanel.description")}
        </motion.p>
      </div>

      {/* Stats */}
      <div className="relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-1"
        >
          <AnimatedCounter
            target={12500}
            suffix="+"
            format="compact"
            className="font-heading text-3xl font-bold text-brand-300"
          />
          <p className="text-sm text-white/60">
            {t("leftPanel.connectedProfessionals")}
          </p>
        </motion.div>

        {/* Animated icons row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-3"
        >
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-sm text-white/60"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 1 + i * 0.1,
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                {i === 1 && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                  />
                )}
                {i === 2 && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                )}
                {i === 3 && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                )}
                {i === 4 && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                )}
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="space-y-3 border-t border-white/10 pt-6"
        >
          <p className="text-sm italic leading-relaxed text-white/60">
            &ldquo;{t("leftPanel.testimonial.quote")}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-500/30 text-xs font-semibold text-white">
              MR
            </div>
            <div>
              <p className="text-xs font-medium text-white/80">
                {t("leftPanel.testimonial.name")}
              </p>
              <p className="text-xs text-white/40">
                {t("leftPanel.testimonial.role")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
