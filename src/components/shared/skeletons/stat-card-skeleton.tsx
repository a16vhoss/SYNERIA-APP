import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardSkeletonProps {
  className?: string;
}

export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10",
        className
      )}
    >
      {/* Icon circle */}
      <Skeleton className="size-11 rounded-full" />

      {/* Value + trend */}
      <div className="flex items-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="mb-1 h-4 w-12" />
      </div>

      {/* Label */}
      <Skeleton className="h-4 w-28" />
    </div>
  );
}
