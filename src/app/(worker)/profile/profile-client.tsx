"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileHeader } from "@/components/worker/profile/profile-header";
import { ProfileTabs, type ProfileTabId } from "@/components/worker/profile/profile-tabs";
import { TabInfoPersonal } from "@/components/worker/profile/tab-info-personal";
import { TabExperiencia } from "@/components/worker/profile/tab-experiencia";
import { TabEducacion } from "@/components/worker/profile/tab-educacion";
import { TabDocumentos } from "@/components/worker/profile/tab-documentos";
import { TabConfiguracion } from "@/components/worker/profile/tab-configuracion";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
  skills: string[];
  languages: string[];
  experience_years: number;
  education: { id: string }[];
  certifications: { id: string }[];
  availability: string;
  desired_salary?: number | null;
  passport_verified: boolean;
  profile_complete: boolean;
  documents: { passport?: boolean; cv?: boolean };
  desired_countries: string[];
  desired_sectors: string[];
}

interface ProfileClientProps {
  profile: ProfileData;
  completionPercentage: number;
}

export function ProfileClient({ profile, completionPercentage }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("info");

  const nameParts = profile.full_name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="space-y-6">
      <ProfileHeader
        firstName={firstName}
        lastName={lastName}
        avatarUrl={profile.avatar_url}
        city={profile.city || ""}
        country={profile.country || ""}
        profileCompletion={completionPercentage}
        verified={profile.passport_verified}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "info" && (
            <TabInfoPersonal
              defaultValues={{
                fullName: profile.full_name,
                email: profile.email,
                phone: profile.phone || "",
                country: profile.country || "",
                city: profile.city || "",
                dateOfBirth: profile.date_of_birth || "",
                bio: profile.bio || "",
              }}
            />
          )}
          {activeTab === "experiencia" && <TabExperiencia />}
          {activeTab === "educacion" && <TabEducacion />}
          {activeTab === "documentos" && <TabDocumentos />}
          {activeTab === "configuracion" && <TabConfiguracion />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
