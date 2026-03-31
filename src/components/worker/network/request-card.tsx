"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { Button } from "@/components/ui/button";
import type { NetworkRequest } from "@/lib/constants/mock-data";

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 dia";
  return `Hace ${diffDays} dias`;
}

interface RequestCardProps {
  request: NetworkRequest;
  index?: number;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function RequestCard({
  request,
  index = 0,
  onAccept,
  onReject,
  onCancel,
}: RequestCardProps) {
  const isIncoming = request.direction === "incoming";

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={request.id}
        layout
        className={cn(
          "flex items-start gap-4 rounded-xl border border-white/20 bg-white/60 p-4 backdrop-blur-md",
          "shadow-[var(--shadow-card)]",
          "dark:border-white/10 dark:bg-white/5"
        )}
        initial={{ opacity: 0, x: isIncoming ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isIncoming ? 20 : -20, height: 0, marginBottom: 0, padding: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          delay: index * 0.08,
        }}
      >
        <CompanyAvatar
          letter={request.avatarLetter}
          gradient={request.avatarGradient}
          size="md"
        />

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-heading text-sm font-semibold text-foreground">
              {request.name}
            </h4>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              {getRelativeTime(request.sentAt)}
            </span>
          </div>

          {isIncoming && request.message && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              &ldquo;{request.message}&rdquo;
            </p>
          )}

          {!isIncoming && (
            <span className="text-xs text-muted-foreground">
              Solicitud pendiente
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {isIncoming ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept?.(request.id)}
                >
                  <Check className="mr-1 size-3.5" />
                  Aceptar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(request.id)}
                >
                  <X className="mr-1 size-3.5" />
                  Rechazar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel?.(request.id)}
              >
                <X className="mr-1 size-3.5" />
                Cancelar solicitud
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
