"use client";

import { motion } from "framer-motion";
import { MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/progress-bar";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  city: string;
  country: string;
  profileCompletion: number;
  verified: boolean;
}

export function ProfileHeader({
  firstName,
  lastName,
  avatarUrl,
  city,
  country,
  profileCompletion,
  verified,
}: ProfileHeaderProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <motion.div
      className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      {/* Left side: avatar + info */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <motion.div
          className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${firstName} ${lastName}`}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span className="font-heading">{initials}</span>
          )}
        </motion.div>

        {/* Name + location + verification */}
        <div className="flex flex-col gap-1.5">
          <motion.h1
            className="font-heading text-2xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {firstName} {lastName}
          </motion.h1>

          <motion.div
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="size-3.5" />
            <span>
              {city}, {country}
            </span>
          </motion.div>

          {/* Verification badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            {verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <AlertTriangle className="size-3" />
                Verificacion Pendiente
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right side: completion + button */}
      <motion.div
        className="flex flex-col items-end gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button size="lg">Actualizar Curriculum</Button>

        <div className="w-48">
          <ProgressBar
            value={profileCompletion}
            label="Perfil completo"
            showPercentage
            color="primary"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
