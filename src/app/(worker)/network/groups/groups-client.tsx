"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { GroupCard } from "@/components/worker/groups/group-card";
import { getGroups, type Group } from "@/lib/actions/groups";
import { cn } from "@/lib/utils";

type Category = "all" | "sector" | "country" | "interest";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "sector", label: "Sector" },
  { id: "country", label: "País" },
  { id: "interest", label: "Interés" },
];

interface GroupsClientProps {
  initialGroups: Group[];
}

export function GroupsClient({ initialGroups }: GroupsClientProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [loading, setLoading] = useState(false);

  const fetchGroups = useCallback(
    async (newSearch: string, newCategory: Category) => {
      setLoading(true);
      try {
        const data = await getGroups({
          search: newSearch || undefined,
          category: newCategory !== "all" ? newCategory : undefined,
        });
        setGroups(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      fetchGroups(value, category);
    },
    [category, fetchGroups]
  );

  const handleCategory = useCallback(
    (cat: Category) => {
      setCategory(cat);
      fetchGroups(search, cat);
    },
    [search, fetchGroups]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Grupos" subtitle="Únete a comunidades de profesionales">
        <Button render={<Link href="/network/groups/create" />}>
          <Plus className="mr-2 size-4" />
          Crear Grupo
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar grupos..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter badges */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategory(cat.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              category === cat.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Groups grid */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-16"
          >
            <div className="size-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </motion.div>
        ) : groups.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-16 text-center"
          >
            <Users className="size-12 text-muted-foreground/50" />
            <p className="font-heading text-lg font-semibold text-foreground">
              No se encontraron grupos
            </p>
            <p className="text-sm text-muted-foreground">
              Intenta con otra búsqueda o crea tu propio grupo.
            </p>
            <Button variant="outline" className="mt-2" render={<Link href="/network/groups/create" />}>
              <Plus className="mr-2 size-4" />
              Crear Grupo
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {groups.map((group, i) => (
              <GroupCard key={group.id} group={group} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
