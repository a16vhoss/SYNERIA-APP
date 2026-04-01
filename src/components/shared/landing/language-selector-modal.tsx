"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "es", label: "Espanol", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { code: "en", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "pt", label: "Portugues", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
  { code: "fr", label: "Francais", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
] as const;

const STORAGE_KEY = "syneria-lang-selected";

export function LanguageSelectorModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const alreadySelected = localStorage.getItem(STORAGE_KEY);
    if (!alreadySelected) {
      // Small delay so the landing page renders first
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleSelect(code: string) {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=${60 * 60 * 24 * 365}`;
    // Remember in localStorage
    localStorage.setItem(STORAGE_KEY, code);
    // Close and reload
    setOpen(false);
    window.location.reload();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-200/60 bg-cream-light shadow-[var(--shadow-modal)]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Decorative top gradient */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

              {/* Content */}
              <div className="flex flex-col items-center px-6 pt-8 pb-6">
                {/* Globe icon with animated ring */}
                <motion.div
                  className="relative mb-5"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Globe className="h-8 w-8 text-brand-600" />
                    </motion.div>
                  </div>
                  <motion.div
                    className="absolute -inset-1 rounded-full border-2 border-brand-300/40"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                {/* Title in two languages */}
                <h2 className="font-heading text-xl font-semibold text-brand-800">
                  Select your language
                </h2>
                <p className="mt-1 text-sm text-brand-600/80">
                  Selecciona tu idioma
                </p>

                {/* Language grid */}
                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                  {LANGUAGES.map((lang, i) => (
                    <motion.button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className="group flex items-center gap-3 rounded-xl border border-brand-200/50 bg-white px-4 py-3.5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.15 + i * 0.06,
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl leading-none">{lang.flag}</span>
                      <span className="text-sm font-medium text-brand-800 group-hover:text-brand-600">
                        {lang.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
