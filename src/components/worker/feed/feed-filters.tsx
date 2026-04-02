"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type FilterType = "all" | "connections" | "groups" | "tips";

interface FilterOption {
  value: FilterType;
  label: string;
}

const FILTERS: FilterOption[] = [
  { value: "all", label: "Todo" },
  { value: "connections", label: "Mis conexiones" },
  { value: "groups", label: "Mis grupos" },
  { value: "tips", label: "Consejos" },
];

interface FeedFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => {
        const isActive = filter.value === activeFilter;
        return (
          <motion.button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            whileTap={{ scale: 0.96 }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            aria-pressed={isActive}
            aria-label={`Filtrar por ${filter.label}`}
          >
            <Badge
              variant={isActive ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-xs font-medium transition-all h-7"
            >
              {filter.label}
            </Badge>
          </motion.button>
        );
      })}
    </div>
  );
}
