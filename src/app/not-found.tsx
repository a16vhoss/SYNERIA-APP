"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Logo size="lg" className="mb-12" />

      {/* Animated 404 */}
      <motion.h1
        className="font-heading text-[10rem] font-extrabold leading-none tracking-tighter text-brand-600/20 sm:text-[14rem]"
        initial={{ opacity: 0, y: -60, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 12,
          mass: 1,
        }}
      >
        404
      </motion.h1>

      {/* Text */}
      <motion.div
        className="mt-2 flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="font-heading text-2xl font-semibold text-foreground">
          {t("pages.notFound")}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("pages.notFoundDesc")}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8"
      >
        <Button size="lg" render={<Link href="/" />}>
          <Home data-icon="inline-start" />
          {t("pages.backToHome")}
        </Button>
      </motion.div>
    </div>
  );
}
