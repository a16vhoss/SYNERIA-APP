"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { joinGroup, leaveGroup, type Group } from "@/lib/actions/groups";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_GRADIENTS: Record<string, string> = {
  sector: "from-blue-400 to-blue-700",
  country: "from-emerald-400 to-emerald-700",
  interest: "from-violet-400 to-violet-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  sector: "Sector",
  country: "País",
  interest: "Interés",
};

interface GroupCardProps {
  group: Group;
  index?: number;
}

export function GroupCard({ group, index = 0 }: GroupCardProps) {
  const [isMember, setIsMember] = useState(group.is_member ?? false);
  const [memberCount, setMemberCount] = useState(group.member_count);
  const [loading, setLoading] = useState(false);

  const gradient = CATEGORY_GRADIENTS[group.category] ?? "from-brand-400 to-brand-700";

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      try {
        if (isMember) {
          await leaveGroup(group.id);
          setIsMember(false);
          setMemberCount((c) => Math.max(0, c - 1));
          toast.success("Has abandonado el grupo");
        } else {
          await joinGroup(group.id);
          setIsMember(true);
          setMemberCount((c) => c + 1);
          toast.success("Te has unido al grupo");
        }
      } catch {
        toast.error("Error al actualizar membresía");
      } finally {
        setLoading(false);
      }
    },
    [isMember, loading, group.id]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.05,
      }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-white/20 bg-white/60 p-5 backdrop-blur-md",
        "shadow-[var(--shadow-card)] dark:border-white/10 dark:bg-white/5"
      )}
    >
      <Link href={`/network/groups/${group.id}`} className="absolute inset-0 z-0 rounded-xl" aria-hidden />

      {/* Header */}
      <div className="relative z-10 flex items-start gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md",
            gradient
          )}
        >
          <Users className="size-6 text-white" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-heading text-sm font-semibold text-foreground">
              {group.name}
            </h3>
            {!group.is_public && (
              <Lock className="size-3 shrink-0 text-muted-foreground" />
            )}
          </div>
          <Badge variant="secondary" className="w-fit text-[10px]">
            {CATEGORY_LABELS[group.category] ?? group.category}
          </Badge>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <p className="relative z-10 line-clamp-2 text-sm text-muted-foreground">
          {group.description}
        </p>
      )}

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3" />
          {memberCount.toLocaleString("es-ES")} miembro{memberCount !== 1 ? "s" : ""}
        </span>
        <Button
          size="sm"
          variant={isMember ? "outline" : "default"}
          onClick={handleToggle}
          disabled={loading}
          className="shrink-0"
        >
          {loading
            ? "..."
            : isMember
            ? "Miembro"
            : "Unirse"}
        </Button>
      </div>
    </motion.div>
  );
}
