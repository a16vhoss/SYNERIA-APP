"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin } from "lucide-react";
import type { PublicProfile } from "@/lib/actions/network";

interface TabAboutProps {
  profile: PublicProfile;
}

export function TabAbout({ profile }: TabAboutProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Bio */}
      {profile.bio && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Sobre mí</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {profile.experience_years > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-blue-400" />
              Experiencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {profile.experience_years} año{profile.experience_years !== 1 ? "s" : ""} de
              experiencia profesional
            </p>
          </CardContent>
        </Card>
      )}

      {/* Desired countries */}
      {profile.desired_countries.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-emerald-400" />
              Países de interés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.desired_countries.map((country) => (
                <Badge key={country} variant="secondary">
                  {country}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desired sectors */}
      {profile.desired_sectors.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Sectores de interés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.desired_sectors.map((sector) => (
                <Badge key={sector} variant="outline">
                  {sector}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!profile.bio &&
        profile.experience_years === 0 &&
        profile.desired_countries.length === 0 &&
        profile.desired_sectors.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-muted-foreground">
              Este usuario no ha completado su información de perfil aún.
            </p>
          </div>
        )}
    </div>
  );
}
