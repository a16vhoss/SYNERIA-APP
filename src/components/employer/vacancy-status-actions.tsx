"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Send,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { MockVacancy } from "@/lib/constants/mock-data";

type VacancyStatus = MockVacancy["status"];

interface VacancyStatusActionsProps {
  vacancy: MockVacancy;
  onStatusChange: (id: string, newStatus: VacancyStatus) => void;
}

interface StatusAction {
  label: string;
  icon: React.ElementType;
  status: VacancyStatus;
  variant?: "destructive";
  confirm?: boolean;
}

function getActions(currentStatus: VacancyStatus): StatusAction[] {
  switch (currentStatus) {
    case "active":
      return [
        { label: "Pausar", icon: Pause, status: "paused" },
        {
          label: "Cerrar",
          icon: XCircle,
          status: "closed",
          variant: "destructive",
          confirm: true,
        },
      ];
    case "paused":
      return [
        { label: "Activar", icon: Play, status: "active" },
        {
          label: "Cerrar",
          icon: XCircle,
          status: "closed",
          variant: "destructive",
          confirm: true,
        },
      ];
    case "closed":
      return [{ label: "Reabrir", icon: RotateCcw, status: "active" }];
    case "draft":
      return [{ label: "Publicar", icon: Send, status: "active" }];
    default:
      return [];
  }
}

const statusLabels: Record<VacancyStatus, string> = {
  active: "Activa",
  paused: "Pausada",
  closed: "Cerrada",
  draft: "Borrador",
};

const toastMessages: Record<VacancyStatus, string> = {
  active: "Vacante activada correctamente",
  paused: "Vacante pausada correctamente",
  closed: "Vacante cerrada correctamente",
  draft: "Vacante movida a borradores",
};

export function VacancyStatusActions({
  vacancy,
  onStatusChange,
}: VacancyStatusActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<VacancyStatus | null>(
    null
  );

  const actions = getActions(vacancy.status);

  function handleAction(action: StatusAction) {
    if (action.confirm) {
      setPendingStatus(action.status);
      setConfirmOpen(true);
    } else {
      applyStatus(action.status);
    }
  }

  function applyStatus(status: VacancyStatus) {
    onStatusChange(vacancy.id, status);
    toast.success(toastMessages[status]);
    setConfirmOpen(false);
    setPendingStatus(null);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon-sm" />
          }
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuLabel>
            Estado: {statusLabels[vacancy.status]}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.status}
                variant={action.variant}
                onClick={() => handleAction(action)}
              >
                <Icon className="size-4" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation dialog for closing */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
              <AlertTriangle className="size-5 text-amber-500" />
              Confirmar Cierre
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence>
            {confirmOpen && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <p className="text-sm text-muted-foreground">
                  Esta seguro que desea cerrar la vacante{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{vacancy.title}&rdquo;
                  </span>
                  ?
                </p>
                {vacancy.applications_count > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>
                      Esta vacante tiene{" "}
                      <strong>{vacancy.applications_count}</strong> aplicaciones
                      activas. Los candidatos seran notificados del cierre.
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" type="button" />}
            >
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() =>
                pendingStatus && applyStatus(pendingStatus)
              }
            >
              <XCircle className="size-4" data-icon="inline-start" />
              Cerrar Vacante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
