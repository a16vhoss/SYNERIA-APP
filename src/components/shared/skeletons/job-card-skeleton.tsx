import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface JobCardSkeletonProps {
  className?: string;
}

export function JobCardSkeleton({ className }: JobCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10",
        className
      )}
    >
      {/* Header: avatar + company */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="size-5" />
      </div>

      {/* Title */}
      <Skeleton className="h-5 w-3/4" />

      {/* Location */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-3.5 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Salary */}
      <Skeleton className="h-4 w-32" />

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Button */}
      <div className="mt-auto pt-2">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}
