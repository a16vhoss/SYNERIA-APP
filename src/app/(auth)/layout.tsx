"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Minimal header with logo */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-16 items-center px-6"
      >
        <Link href="/">
          <Logo size="md" />
        </Link>
      </motion.header>

      {/* Centered content area */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 items-center justify-center px-4 pb-12"
      >
        {children}
      </motion.main>

      {/* Minimal footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="py-4 text-center text-xs text-muted-foreground"
      >
        &copy; {new Date().getFullYear()} Syneria. Todos los derechos reservados.
      </motion.footer>
    </div>
  );
}
