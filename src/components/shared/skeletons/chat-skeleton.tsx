import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatSkeletonProps {
  className?: string;
}

export function ChatSkeleton({ className }: ChatSkeletonProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
        {/* Date separator */}
        <div className="flex justify-center">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Received message */}
        <div className="flex justify-start">
          <Skeleton className="h-10 w-48 rounded-2xl rounded-bl-md" />
        </div>

        {/* Sent message */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-56 rounded-2xl rounded-br-md" />
        </div>

        {/* Received */}
        <div className="flex justify-start">
          <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-md" />
        </div>

        {/* Sent */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 rounded-2xl rounded-br-md" />
        </div>

        {/* Received */}
        <div className="flex justify-start">
          <Skeleton className="h-10 w-52 rounded-2xl rounded-bl-md" />
        </div>

        {/* Sent */}
        <div className="flex justify-end">
          <Skeleton className="h-16 w-60 rounded-2xl rounded-br-md" />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t px-4 py-3">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
