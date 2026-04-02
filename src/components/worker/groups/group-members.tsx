"use client";

import { motion } from "framer-motion";
import { Crown, Shield, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type GroupMember } from "@/lib/actions/groups";
import { cn } from "@/lib/utils";

interface GroupMembersProps {
  members: GroupMember[];
}

const ROLE_CONFIG = {
  admin: {
    label: "Administrador",
    icon: Crown,
    className: "border-purple-200 bg-purple-100 text-purple-700",
    iconClass: "text-purple-600",
  },
  moderator: {
    label: "Moderador",
    icon: Shield,
    className: "border-blue-200 bg-blue-100 text-blue-700",
    iconClass: "text-blue-600",
  },
  member: {
    label: "Miembro",
    icon: Users,
    className: "border-gray-200 bg-gray-100 text-gray-600",
    iconClass: "text-gray-500",
  },
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function GroupMembers({ members }: GroupMembersProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        <Users className="size-10 opacity-40" />
        <p className="font-medium">No hay miembros</p>
      </div>
    );
  }

  // Sort: admin first, then moderator, then member
  const roleOrder = { admin: 0, moderator: 1, member: 2 };
  const sorted = [...members].sort(
    (a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3)
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((member, i) => {
        const profile = member.profile;
        const fullName = profile?.full_name ?? "Usuario";
        const initials = getInitials(fullName);
        const roleConf = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.member;
        const RoleIcon = roleConf.icon;

        const location = [profile?.city, profile?.country]
          .filter(Boolean)
          .join(", ");

        return (
          <motion.div
            key={member.user_id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay: i * 0.04,
            }}
            whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            className={cn(
              "flex items-center gap-4 rounded-xl border border-white/20 bg-white/60 p-4 backdrop-blur-md",
              "shadow-[var(--shadow-card)] dark:border-white/10 dark:bg-white/5"
            )}
          >
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={fullName}
                className="size-11 shrink-0 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white ring-2 ring-border">
                {initials}
              </div>
            )}

            {/* Info */}
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate font-heading text-sm font-semibold text-foreground">
                {fullName}
              </p>

              {/* Role badge */}
              <Badge
                variant="outline"
                className={cn("w-fit gap-1 text-[10px]", roleConf.className)}
              >
                <RoleIcon className={cn("size-3", roleConf.iconClass)} />
                {roleConf.label}
              </Badge>

              {/* Location */}
              {location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
