"use client";

import { useState } from "react";
import { Building2, User, ArrowLeftRight } from "lucide-react";
import { switchRole } from "@/lib/actions/role-switch";

interface RoleSwitchButtonProps {
  activeRole: "worker" | "employer";
}

export function RoleSwitchButton({ activeRole }: RoleSwitchButtonProps) {
  const [loading, setLoading] = useState(false);

  const isWorker = activeRole === "worker";
  const targetLabel = isWorker ? "Cambiar a Empresa" : "Cambiar a Worker";
  const targetDescription = isWorker
    ? "Publicar vacantes y contratar"
    : "Buscar empleos y aplicar";
  const Icon = isWorker ? Building2 : User;

  async function handleSwitch() {
    setLoading(true);
    await switchRole();
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={loading}
      className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 transition-all ${
        isWorker
          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
          : "border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100"
      } ${loading ? "opacity-60" : ""}`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-md ${
          isWorker ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        {loading ? (
          <ArrowLeftRight className="h-3.5 w-3.5 animate-spin text-white" />
        ) : (
          <Icon className="h-3.5 w-3.5 text-white" />
        )}
      </div>
      <div className="text-left">
        <p
          className={`text-[13px] font-semibold ${
            isWorker ? "text-green-700" : "text-blue-700"
          }`}
        >
          {targetLabel}
        </p>
        <p className="text-[11px] text-muted-foreground">{targetDescription}</p>
      </div>
    </button>
  );
}
