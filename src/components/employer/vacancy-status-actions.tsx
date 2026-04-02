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

import { useTranslations } from "next-intl";
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

function getActions(currentStatus: VacancyStatus, t: (key: string) => string): StatusAction[] {
  switch (currentStatus) {
    case "active":
      return [
        { label: t("vacancies.status.unpublish"), icon: Pause, status: "paused" },
        {
          label: t("vacancies.status.close"),
          icon: XCircle,
          status: "closed",
          variant: "destructive",
          confirm: true,
        },
      ];
    case "paused":
      return [
        { label: t("vacancies.status.publish"), icon: Play, status: "active" },
        {
          label: t("vacancies.status.close"),
          icon: XCircle,
          status: "closed",
          variant: "destructive",
          confirm: true,
        },
      ];
    case "closed":
      return [{ label: t("vacancies.status.reopen"), icon: RotateCcw, status: "active" }];
    case "draft":
      return [{ label: t("vacancies.status.publish"), icon: Send, status: "active" }];
    default:
      return [];
  }
}

export function VacancyStatusActions({
  vacancy,
  onStatusChange,
}: VacancyStatusActionsProps) {
  const t = useTranslations("employer");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<VacancyStatus | null>(
    null
  );

  const actions = getActions(vacancy.status, t);

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
    toast.success(t("vacancies.edit.success"));
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
            {t("dashboard.vacanciesTable.status")}: {vacancy.status}
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
              {t("vacancies.status.close")}
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
                  {t("vacancies.status.deleteConfirm")}{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{vacancy.title}&rdquo;
                  </span>
                  ?
                </p>
                {vacancy.applications_count > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {t("vacancies.status.closeWarning", { count: vacancy.applications_count })}
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
              {t("vacancies.edit.save")}
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() =>
                pendingStatus && applyStatus(pendingStatus)
              }
            >
              <XCircle className="size-4" data-icon="inline-start" />
              {t("vacancies.status.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
