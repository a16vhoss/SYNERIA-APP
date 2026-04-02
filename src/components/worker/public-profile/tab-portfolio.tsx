"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Video, FileText } from "lucide-react";
import type { PortfolioItem } from "@/lib/actions/portfolio";

interface TabPortfolioProps {
  items: PortfolioItem[];
}

const TYPE_META = {
  photo: { label: "FOTO", Icon: Image, color: "bg-blue-500/20 text-blue-400" },
  video: { label: "VIDEO", Icon: Video, color: "bg-purple-500/20 text-purple-400" },
  document: { label: "PDF", Icon: FileText, color: "bg-orange-500/20 text-orange-400" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });
}

export function TabPortfolio({ items }: TabPortfolioProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Image className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Este usuario aún no ha publicado items en su portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.Icon;

        return (
          <Card
            key={item.id}
            className="group overflow-hidden bg-card/60 backdrop-blur-sm transition-shadow hover:shadow-lg"
          >
            {/* Thumbnail or icon placeholder */}
            <div className="relative flex h-40 items-center justify-center bg-muted/30">
              {item.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon className="h-12 w-12 text-muted-foreground/30" />
              )}
              <Badge
                className={`absolute left-2 top-2 text-xs font-semibold ${meta.color}`}
                variant="outline"
              >
                {meta.label}
              </Badge>
            </div>

            <CardContent className="flex flex-col gap-2 p-4">
              <h3 className="line-clamp-1 font-semibold text-foreground">{item.title}</h3>
              {item.project_date && (
                <p className="text-xs text-muted-foreground">{formatDate(item.project_date)}</p>
              )}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
