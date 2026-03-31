"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NetworkConnection } from "@/lib/constants/mock-data";

interface ConnectionCardProps {
  connection: NetworkConnection;
  index?: number;
  onRemove?: (id: string) => void;
}

export function ConnectionCard({
  connection,
  index = 0,
  onRemove,
}: ConnectionCardProps) {
  const connectedDate = new Date(connection.connectedSince);
  const formattedDate = connectedDate.toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-white/20 bg-white/60 p-5 backdrop-blur-md",
        "shadow-[var(--shadow-card)]",
        "dark:border-white/10 dark:bg-white/5"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -4,
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.1), 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CompanyAvatar
            letter={connection.avatarLetter}
            gradient={connection.avatarGradient}
            size="lg"
            imageUrl={connection.avatarUrl}
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-sm font-semibold text-foreground leading-tight">
              {connection.name}
            </h3>
            <Badge variant="secondary" className="w-fit text-[10px]">
              {connection.role === "worker" ? "Trabajador" : "Empresa"}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onRemove?.(connection.id)}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar conexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        {connection.company && (
          <span className="font-medium text-foreground/80">
            {connection.company}
          </span>
        )}
        <span>{connection.sector}</span>
        <span className="flex items-center gap-1">
          <MapPin className="size-3" />
          {connection.city}, {connection.country}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          Conectados desde {formattedDate}
        </span>
        {connection.mutualConnections > 0 && (
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {connection.mutualConnections} conexiones mutuas
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1">
          Ver Perfil
        </Button>
        <Button variant="ghost" size="icon-sm">
          <MessageSquare className="size-4" />
        </Button>
      </div>
    </motion.div>
  );
}
