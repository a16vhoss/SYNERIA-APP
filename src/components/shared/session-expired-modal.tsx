"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionExpiredModalProps {
  open: boolean;
}

const FORM_DATA_KEY = "syneria_unsaved_form_data";

/**
 * Save any currently focused form data to localStorage before redirect.
 */
function saveFormData() {
  try {
    const forms = document.querySelectorAll("form");
    const formDataMap: Record<string, Record<string, string>> = {};

    forms.forEach((form, formIdx) => {
      const inputs = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");
      const data: Record<string, string> = {};

      inputs.forEach((input) => {
        if (input.name && input.value && input.type !== "password") {
          data[input.name] = input.value;
        }
      });

      if (Object.keys(data).length > 0) {
        formDataMap[`form_${formIdx}`] = data;
      }
    });

    if (Object.keys(formDataMap).length > 0) {
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formDataMap));
    }
  } catch {
    // Silently fail - localStorage may be full or unavailable
  }
}

export function SessionExpiredModal({ open }: SessionExpiredModalProps) {
  const handleLogin = useCallback(() => {
    saveFormData();
    window.location.href = "/login";
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Clock className="size-8" />
              </div>

              <h2 className="font-heading text-lg font-semibold text-foreground">
                Tu sesion ha expirado
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Tu sesion ha expirado por inactividad. Inicia sesion de nuevo
                para continuar.
              </p>

              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={handleLogin}
              >
                <LogIn data-icon="inline-start" />
                Iniciar sesion de nuevo
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
