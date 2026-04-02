"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedComposer } from "@/components/worker/feed/feed-composer";
import { FeedFilters } from "@/components/worker/feed/feed-filters";
import { FeedPost } from "@/components/worker/feed/feed-post";
import { getFeedItems, type FeedItem } from "@/lib/actions/feed";
import { PageHeader } from "@/components/shared/page-header";

type FilterType = "all" | "connections" | "groups" | "tips";

interface FeedClientProps {
  initialItems: FeedItem[];
  initialCursor: string | null;
}

export function FeedClient({ initialItems, initialCursor }: FeedClientProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const { items: newItems, nextCursor } = await getFeedItems({
        type: filter,
        cursor,
      });
      setItems((prev) => [...prev, ...newItems]);
      setCursor(nextCursor);
    } finally {
      setLoading(false);
    }
  }, [cursor, filter, loading]);

  const handleFilterChange = useCallback(async (newFilter: FilterType) => {
    setFilter(newFilter);
    setLoading(true);
    setItems([]);
    setCursor(null);
    try {
      const { items: freshItems, nextCursor } = await getFeedItems({
        type: newFilter,
      });
      setItems(freshItems);
      setCursor(nextCursor);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOptimisticPost = useCallback((newItem: FeedItem) => {
    setItems((prev) => [newItem, ...prev]);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title="Feed de Actividad"
        subtitle="Mantente conectado con tu red profesional"
      />

      <FeedComposer onPost={handleOptimisticPost} />

      <FeedFilters activeFilter={filter} onFilterChange={handleFilterChange} />

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {loading && items.length === 0 ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground"
            >
              <p className="text-base font-medium">No hay publicaciones aún</p>
              <p className="mt-1 text-sm">
                Conecta con más personas para ver su actividad aquí.
              </p>
            </motion.div>
          ) : (
            items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  delay: Math.min(i * 0.04, 0.3),
                }}
              >
                <FeedPost item={item} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {cursor && (
        <div className="flex justify-center pb-6">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="min-w-40"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
