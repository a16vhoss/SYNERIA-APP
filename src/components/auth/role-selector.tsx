"use client";

import { motion } from "framer-motion";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "worker" | "employer";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

const roles: { value: Role; label: string; icon: typeof User }[] = [
  { value: "worker", label: "Soy Trabajador", icon: User },
  { value: "employer", label: "Soy Empresa", icon: Building2 },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="relative flex w-full rounded-xl bg-muted p-1">
      {roles.map((role) => {
        const Icon = role.icon;
        const isActive = value === role.value;

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
              {role.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
