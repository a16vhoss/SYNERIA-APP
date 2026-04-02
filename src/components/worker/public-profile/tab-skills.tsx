"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import type { PublicProfile } from "@/lib/actions/network";

interface TabSkillsProps {
  profile: PublicProfile;
}

export function TabSkills({ profile }: TabSkillsProps) {
  const hasSkills = profile.skills.length > 0;
  const hasCertifications = profile.certifications.length > 0;

  if (!hasSkills && !hasCertifications) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Award className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Este usuario no ha añadido habilidades todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasSkills && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Habilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasCertifications && (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-yellow-400" />
              Certificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert) => (
                <Badge
                  key={cert}
                  variant="outline"
                  className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                >
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
