"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Award,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { Button } from "@/components/ui/button";
import type { NetworkActivity } from "@/lib/constants/mock-data";

const typeIcons: Record<NetworkActivity["type"], typeof Briefcase> = {
  new_job: Briefcase,
  completed_contract: CheckCircle2,
  endorsement: Award,
  new_connection: UserPlus,
};

const typeColors: Record<NetworkActivity["type"], string> = {
  new_job: "text-brand-600",
  completed_contract: "text-emerald-600",
  endorsement: "text-amber-600",
  new_connection: "text-sky-600",
};

interface ActivityFeedProps {
  activities: NetworkActivity[];
  className?: string;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {activities.map((activity, i) => {
        const Icon = typeIcons[activity.type];
        return (
          <motion.div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/40 dark:hover:bg-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
              delay: i * 0.07,
            }}
          >
            <CompanyAvatar
              letter={activity.actorLetter}
              gradient={activity.actorGradient}
              size="sm"
            />

            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm leading-snug text-foreground">
                <span className="font-semibold">{activity.actorName}</span>{" "}
                <span className="text-muted-foreground">{activity.text}</span>
              </p>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Icon className={cn("size-3", typeColors[activity.type])} />
                  {activity.time}
                </span>

                {activity.ctaLabel && activity.ctaHref && (
                  <Button variant="link" size="xs" className="h-auto p-0 text-[11px]">
                    {activity.ctaLabel}
                    <ArrowRight className="ml-0.5 size-3" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
