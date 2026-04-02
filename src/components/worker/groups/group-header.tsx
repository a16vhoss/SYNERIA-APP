"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { joinGroup, leaveGroup, type Group } from "@/lib/actions/groups";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_GRADIENTS: Record<string, string> = {
  sector: "from-blue-400 via-blue-500 to-blue-700",
  country: "from-emerald-400 via-emerald-500 to-emerald-700",
  interest: "from-violet-400 via-violet-500 to-violet-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  sector: "Sector profesional",
  country: "País",
  interest: "Interés",
};

interface GroupHeaderProps {
  group: Group;
  onJoinLeave?: (isMember: boolean) => void;
}

export function GroupHeader({ group, onJoinLeave }: GroupHeaderProps) {
  const [isMember, setIsMember] = useState(group.is_member ?? false);
  const [memberCount, setMemberCount] = useState(group.member_count);
  const [loading, setLoading] = useState(false);

  const gradient =
    CATEGORY_GRADIENTS[group.category] ?? "from-brand-400 via-brand-500 to-brand-700";

  const handleToggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isMember) {
        await leaveGroup(group.id);
        setIsMember(false);
        setMemberCount((c) => Math.max(0, c - 1));
        onJoinLeave?.(false);
        toast.success("Has abandonado el grupo");
      } else {
        await joinGroup(group.id);
        setIsMember(true);
        setMemberCount((c) => c + 1);
        onJoinLeave?.(true);
        toast.success("¡Bienvenido al grupo!");
      }
    } catch {
      toast.error("Error al actualizar membresía");
    } finally {
      setLoading(false);
    }
  }, [isMember, loading, group.id, onJoinLeave]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-xl",
        gradient
      )}
    >
      {/* Decorative blur orbs */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-white/10 blur-2xl" />

      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link href="/network/groups" />}
        className="relative z-10 mb-4 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft className="mr-2 size-4" />
        Grupos
      </Button>

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {/* Left: icon + info */}
        <div className="flex items-start gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg ring-2 ring-white/30">
            <Users className="size-8 text-white" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-bold leading-tight sm:text-2xl">
                {group.name}
              </h1>
              {!group.is_public && (
                <Lock className="size-4 text-white/70" />
              )}
            </div>
            {group.description && (
              <p className="max-w-prose text-sm text-white/80 leading-relaxed line-clamp-2">
                {group.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/30 bg-white/20 text-white hover:bg-white/30">
                {CATEGORY_LABELS[group.category] ?? group.category}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-white/80">
                <Users className="size-3.5" />
                {memberCount.toLocaleString("es-ES")} miembro{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Right: join/leave button */}
        {group.user_role !== "admin" && (
          <Button
            onClick={handleToggle}
            disabled={loading}
            variant={isMember ? "outline" : "default"}
            size="lg"
            className={cn(
              "shrink-0",
              isMember
                ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
                : "bg-white text-brand-700 hover:bg-white/90"
            )}
          >
            {loading ? "..." : isMember ? "Abandonar grupo" : "Unirse al grupo"}
          </Button>
        )}
        {group.user_role === "admin" && (
          <Badge className="border-white/30 bg-white/20 text-white">
            Administrador
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
