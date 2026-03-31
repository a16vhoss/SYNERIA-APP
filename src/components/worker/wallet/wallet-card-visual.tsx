"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Wifi } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Wallet Card Visual                                                 */
/* ------------------------------------------------------------------ */

interface WalletCardVisualProps {
  holderName?: string;
  lastFour?: string;
  expiry?: string;
}

export function WalletCardVisual({
  holderName = "Ana Garcia",
  lastFour = "4829",
  expiry = "12/29",
}: WalletCardVisualProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="relative h-52 w-full max-w-sm cursor-pointer overflow-hidden rounded-3xl p-6"
      style={{
        background: "linear-gradient(135deg, #0B2118 0%, #2D6A4F 60%, #40916C 100%)",
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ boxShadow: "0 20px 60px rgba(11,33,24,0.4)" }}
    >
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-12 -top-12 size-48 rounded-full border border-white/20" />
        <div className="absolute -bottom-8 -left-8 size-32 rounded-full border border-white/20" />
      </div>

      {/* Top row: Logo + Contactless */}
      <div className="flex items-center justify-between">
        <span className="font-heading text-xl font-bold tracking-wide text-white">
          Syneria
        </span>
        <Wifi className="size-6 rotate-90 text-white/60" />
      </div>

      {/* Chip */}
      <div className="mt-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-500">
          <div className="grid size-6 grid-cols-2 gap-0.5">
            <div className="rounded-tl-sm bg-yellow-700/40" />
            <div className="rounded-tr-sm bg-yellow-700/30" />
            <div className="rounded-bl-sm bg-yellow-700/30" />
            <div className="rounded-br-sm bg-yellow-700/40" />
          </div>
        </div>
      </div>

      {/* Card Number */}
      <p className="mt-4 font-mono text-lg tracking-[0.25em] text-white/90">
        &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;{" "}
        {lastFour}
      </p>

      {/* Bottom: Holder + Expiry */}
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/40">
            Titular
          </p>
          <p className="text-sm font-medium tracking-wide text-white">
            {holderName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/40">
            Expira
          </p>
          <p className="font-mono text-sm text-white">{expiry}</p>
        </div>
      </div>
    </motion.div>
  );
}
