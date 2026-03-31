"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

const shakeVariants = {
  initial: { x: 0 },
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.6, ease: "easeInOut" as const },
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Syneria Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Logo size="lg" className="mb-12" />

      {/* Shaking icon */}
      <motion.div
        className="flex size-20 items-center justify-center rounded-full bg-destructive/10"
        variants={shakeVariants}
        initial="initial"
        animate="shake"
      >
        <AlertTriangle className="size-10 text-destructive" />
      </motion.div>

      {/* Text */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          Algo salio mal
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocurrio un error inesperado. Puedes intentar de nuevo o volver al
          inicio.
        </p>
      </motion.div>

      {/* Error details (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <motion.details
          className="mt-4 w-full max-w-lg rounded-lg border border-destructive/20 bg-destructive/5 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <summary className="cursor-pointer text-xs font-medium text-destructive">
            Detalles del error
          </summary>
          <pre className="mt-2 overflow-x-auto text-xs text-destructive/80">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </motion.details>
      )}

      {/* Actions */}
      <motion.div
        className="mt-8 flex gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Button onClick={reset} size="lg">
          <RefreshCw data-icon="inline-start" />
          Intentar de nuevo
        </Button>
      </motion.div>
    </div>
  );
}
