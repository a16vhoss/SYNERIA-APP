"use client";

import { motion } from "framer-motion";
import { Building2, CheckCircle } from "lucide-react";

interface DashboardHeaderProps {
  companyName: string;
  verified?: boolean;
}

export function DashboardHeader({
  companyName,
  verified = false,
}: DashboardHeaderProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-8 md:px-10 md:py-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {/* Subtle animated gradient overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Building2 className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">
                Bienvenido, {companyName}
              </h1>
              {verified && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 15 }}
                >
                  <CheckCircle className="size-5 text-brand-200" />
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.p
          className="mt-2 text-sm text-brand-100/90 md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Encuentra y gestiona los mejores talentos
        </motion.p>
      </div>
    </motion.div>
  );
}
