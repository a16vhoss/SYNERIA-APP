"use client";

import { motion } from "framer-motion";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Role = "worker" | "employer";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const roleConfig: { value: Role; icon: typeof User }[] = [
  { value: "worker", icon: User },
  { value: "employer", icon: Building2 },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const t = useTranslations("auth");
  return (
    <div className="relative flex w-full rounded-xl bg-muted p-1">
      {roleConfig.map((role) => {
        const Icon = role.icon;
        const isActive = value === role.value;
        const label = role.value === "worker" ? t("roles.worker") : t("roles.employer");

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="role-selector-bg"
                className="absolute inset-0 rounded-lg bg-brand-700"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="size-4" />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
