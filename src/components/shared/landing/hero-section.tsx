"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

const rotatingWords = [
  "profesionales",
  "oportunidades",
  "empresas",
  "talento global",
];

function FloatingShape({
  className,
  delay = 0,
  duration = 6,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.15, 0.15, 0],
        y: [0, -30, -15, 0],
        x: [0, 10, -10, 0],
        rotate: [0, 5, -3, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700" />

      {/* Aurora / glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/3 -left-1/4 w-[80vw] h-[80vw] rounded-full bg-brand-500/10 blur-[120px]"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-brand-400/8 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] rounded-full bg-brand-300/6 blur-[80px]"
          animate={{
            scale: [1, 0.9, 1.1, 1],
            opacity: [0.06, 0.1, 0.06],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Floating decorative shapes */}
      <FloatingShape
        className="absolute top-[15%] left-[10%] w-24 h-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
        delay={0}
        duration={7}
      />
      <FloatingShape
        className="absolute top-[25%] right-[12%] w-16 h-16 rounded-full border border-white/8 bg-white/3"
        delay={1.5}
        duration={8}
      />
      <FloatingShape
        className="absolute bottom-[20%] left-[15%] w-20 h-20 rounded-xl border border-white/10 bg-white/4 rotate-12"
        delay={3}
        duration={9}
      />
      <FloatingShape
        className="absolute bottom-[30%] right-[8%] w-12 h-12 rounded-lg border border-white/8 bg-white/3 rotate-45"
        delay={2}
        duration={6}
      />
      <FloatingShape
        className="absolute top-[60%] left-[5%] w-8 h-8 rounded-full border border-brand-400/20 bg-brand-400/5"
        delay={4}
        duration={5}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-28 pb-20">
        {/* Tagline pill */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-8"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-400" />
          </span>
          <span className="text-sm font-medium text-brand-100">
            Plataforma Global de Empleo
          </span>
        </motion.div>

        {/* Main heading - letter stagger */}
        <motion.h1
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.03 } },
          }}
        >
          {"El Futuro del Trabajo es Global.".split("").map((char, i) => (
            <motion.span
              key={`line1-${i}`}
              variants={{
                hidden: { opacity: 0, y: 40, rotateX: -40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
          <br />
          {"Y Empieza Aqui.".split("").map((char, i) => (
            <motion.span
              key={`line2-${i}`}
              variants={{
                hidden: { opacity: 0, y: 40, rotateX: -40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle with rotating word */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-lg sm:text-xl text-brand-200/90 max-w-2xl mx-auto mb-4 font-body leading-relaxed"
        >
          La plataforma que conecta trabajadores migrantes con empleadores
          internacionales. Contratos digitales, wallet integrada y soporte en 6 idiomas.
        </motion.p>

        {/* Rotating words line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center gap-2 text-lg sm:text-xl text-brand-300 mb-10"
        >
          <span className="font-body">Conecta con</span>
          <span className="relative inline-block w-52 h-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 font-heading font-semibold text-brand-300"
              >
                {rotatingWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/jobs"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-500 text-white font-semibold text-base hover:bg-brand-400 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97]"
          >
            Explorar Empleos
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            {/* Glow effect */}
            <span className="absolute inset-0 rounded-full bg-brand-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </Link>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/50 transition-all duration-300 active:scale-[0.97] backdrop-blur-sm"
          >
            <Building2 className="size-4" />
            Publicar Empleo
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-brand-300/60 text-xs font-medium uppercase tracking-wider"
        >
          <span>Presente en 28 paises</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-brand-400/40" />
          <span>+12,500 trabajadores</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-brand-400/40" />
          <span>+3,200 empresas</span>
        </motion.div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 73.3C480 67 600 73 720 80C840 87 960 93 1080 90C1200 87 1320 73 1380 66.7L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="var(--color-cream-light, #FAF8F5)"
          />
        </svg>
      </div>
    </section>
  );
}
