"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const t = useTranslations("common.landing.nav");

  const navLinks = [
    { label: t("home"), href: "#inicio" },
    { label: t("jobs"), href: "#plataforma" },
    { label: t("companies"), href: "#como-funciona" },
    { label: t("sectors"), href: "#sectores" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl",
          "rounded-full border px-4 py-2.5 md:px-6 md:py-3",
          "transition-all duration-500 ease-out",
          scrolled
            ? "bg-white/80 border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl"
            : "bg-white/10 border-white/15 backdrop-blur-sm"
        )}
      >
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-300",
                  scrolled
                    ? "text-brand-800 hover:bg-brand-50 hover:text-brand-700"
                    : "text-brand-800/80 hover:bg-white/15 hover:text-brand-900"
                )}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Link
                href="/login"
                className={cn(
                  "hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold",
                  "bg-brand-600 text-white hover:bg-brand-700",
                  "transition-all duration-300 hover:shadow-lg hover:shadow-brand-600/25",
                  "active:scale-[0.97]"
                )}
              >
                {t("login")}
              </Link>
            </motion.div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-full transition-colors",
                scrolled ? "text-brand-700 hover:bg-brand-50" : "text-brand-800 hover:bg-white/15"
              )}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden"
        >
          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            className="flex flex-col gap-2"
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="text-lg font-heading font-semibold text-brand-800 py-3 px-4 rounded-xl hover:bg-brand-50 transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="pt-4"
            >
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-3.5 rounded-full bg-brand-600 text-white font-semibold text-base hover:bg-brand-700 transition-colors"
              >
                {t("login")}
              </Link>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </>
  );
}
