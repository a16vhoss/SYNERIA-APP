"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield } from "lucide-react";
import type { PublicProfile } from "@/lib/actions/network";

interface ProfileHeroProps {
  profile: PublicProfile;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const availabilityLabel =
    profile.availability === "immediate"
      ? "Disponible ahora"
      : profile.availability === "two_weeks"
        ? "En 2 semanas"
        : profile.availability === "one_month"
          ? "En 1 mes"
          : "Disponibilidad flexible";

  const availabilityColor =
    profile.availability === "immediate"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

  return (
    <div className="relative">
      {/* Gradient banner */}
      <div className="h-40 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600" />

      {/* Avatar + info row */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative -mt-16 flex items-end gap-4 pb-4">
          <Avatar className="h-32 w-32 ring-4 ring-background">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
            <AvatarFallback className="bg-indigo-700 text-2xl font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="mb-2 flex flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>

            <p className="text-sm text-muted-foreground">
              {profile.skills[0] ?? "Trabajador"}{" "}
              {profile.experience_years > 0 && (
                <span>· {profile.experience_years} años de experiencia</span>
              )}
            </p>

            <div className="mt-1 flex flex-wrap gap-2">
              {(profile.city || profile.country) && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 text-xs"
                >
                  <MapPin className="h-3 w-3" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </Badge>
              )}

              <Badge
                variant="outline"
                className={`border text-xs ${availabilityColor}`}
              >
                {availabilityLabel}
              </Badge>

              {profile.passport_verified && (
                <Badge
                  variant="outline"
                  className="border-green-500/30 bg-green-500/20 text-xs text-green-400"
                >
                  <Shield className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
