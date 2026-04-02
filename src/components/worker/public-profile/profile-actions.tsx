"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare, Award, Check, Clock } from "lucide-react";
import { sendConnectionRequest } from "@/lib/actions/network";
import { RecommendationModal } from "./recommendation-modal";
import { toast } from "sonner";
import type { PublicProfile } from "@/lib/actions/network";

interface ProfileActionsProps {
  userId: string;
  connectionStatus: {
    status: "none" | "pending_sent" | "pending_received" | "accepted" | "blocked";
    connectionId: string | null;
  };
  alreadyRecommended: boolean;
  profile: PublicProfile;
}

export function ProfileActions({
  userId,
  connectionStatus,
  alreadyRecommended,
  profile,
}: ProfileActionsProps) {
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState(connectionStatus.status);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (localStatus !== "none") return;
    setConnecting(true);
    try {
      const result = await sendConnectionRequest(userId);
      if (result.success) {
        setLocalStatus("pending_sent");
        toast.success("Solicitud de conexión enviada");
      } else {
        toast.error("Error al enviar la solicitud");
      }
    } catch {
      toast.error("Error al enviar la solicitud");
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages?to=${userId}`);
  };

  const connectLabel =
    localStatus === "accepted"
      ? "Conectado"
      : localStatus === "pending_sent"
        ? "Solicitud enviada"
        : localStatus === "pending_received"
          ? "Responder solicitud"
          : "Conectar";

  const ConnectIcon =
    localStatus === "accepted"
      ? Check
      : localStatus === "pending_sent"
        ? Clock
        : UserPlus;

  const connectDisabled =
    localStatus === "accepted" || localStatus === "pending_sent" || connecting;

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          onClick={handleConnect}
          disabled={connectDisabled}
          variant={localStatus === "accepted" ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <ConnectIcon className="h-4 w-4" />
          {connectLabel}
        </Button>

        <Button
          onClick={handleMessage}
          variant="outline"
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Mensaje
        </Button>

        {!alreadyRecommended && (
          <Button
            onClick={() => setRecommendOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" />
            Recomendar
          </Button>
        )}
      </div>

      <RecommendationModal
        open={recommendOpen}
        onClose={() => setRecommendOpen(false)}
        recipientId={userId}
        recipientName={profile.full_name}
        recipientSkills={profile.skills}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
