"use client";

import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface LoadingButtonProps extends ButtonProps, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("relative", className)}
      {...props}
    >
      {loading && (
        <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
