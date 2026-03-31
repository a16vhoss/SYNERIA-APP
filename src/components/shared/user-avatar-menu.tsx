"use client";

import { User, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserAvatarMenuProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatarMenu({
  name,
  email,
  avatarUrl,
  onViewProfile,
  onSettings,
  onLogout,
  className,
}: UserAvatarMenuProps) {
  const initials = getInitials(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-lg outline-none",
          className
        )}
      >
        <motion.div
          className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-heading text-sm font-bold text-white"
          whileHover={{
            boxShadow: "0 0 0 3px rgba(45,106,79,0.2)",
          }}
          transition={{ duration: 0.2 }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="size-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {/* User info header */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">{name}</p>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onViewProfile}>
          <User className="size-4" />
          <span>Ver Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onSettings}>
          <Settings className="size-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} variant="destructive">
          <LogOut className="size-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
