"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  showButton?: boolean;
  buttonLabel?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Buscar...",
  value: controlledValue,
  onChange,
  onSearch,
  showButton = false,
  buttonLabel = "Buscar",
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [focused, setFocused] = useState(false);
  const value = controlledValue ?? internalValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (onChange) {
      onChange(v);
    } else {
      setInternalValue(v);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onSearch?.(value);
    }
  }

  return (
    <motion.div
      className={cn("relative flex items-center gap-2", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "relative flex flex-1 items-center overflow-hidden rounded-lg border border-input bg-card transition-all duration-200",
          focused && "border-brand-500 ring-2 ring-brand-500/20"
        )}
      >
        <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="h-9 w-full bg-transparent px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showButton && (
        <Button onClick={() => onSearch?.(value)}>{buttonLabel}</Button>
      )}
    </motion.div>
  );
}
