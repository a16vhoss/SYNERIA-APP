"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  Pencil,
  X,
  Loader2,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  Plus,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  getPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  uploadPortfolioFile,
  type PortfolioItem,
} from "@/lib/actions/portfolio";
import { PORTFOLIO_LIMITS } from "@/lib/validations/portfolio";

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.18 } },
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FileType = "photo" | "video" | "document";

interface EditState {
  id: string;
  title: string;
  description: string;
  tags: string[];
  tagInput: string;
}

interface UploadingItem {
  type: FileType;
  name: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function typeIcon(type: FileType) {
  if (type === "photo") return ImageIcon;
  if (type === "video") return VideoIcon;
  return FileTextIcon;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeAccept(type: FileType): string {
  return PORTFOLIO_LIMITS[type].mimeTypes.join(",");
}

function countByType(items: PortfolioItem[]): Record<FileType, number> {
  const counts: Record<FileType, number> = { photo: 0, video: 0, document: 0 };
  for (const item of items) counts[item.type]++;
  return counts;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface TabPortfolioProps {
  profileId: string;
}

export function TabPortfolio({ profileId }: TabPortfolioProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<UploadingItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  /* ---- Load items ---- */
  const loadItems = useCallback(async () => {
    try {
      const data = await getPortfolioItems(profileId);
      setItems(data);
    } catch (err) {
      console.error("Error loading portfolio:", err);
      toast.error(tc("misc.error"));
    } finally {
      setLoading(false);
    }
  }, [profileId, tc]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /* ---- Upload ---- */
  async function handleUpload(fileList: FileList | null, type: FileType) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    const counts = countByType(items);
    if (counts[type] >= PORTFOLIO_LIMITS[type].maxCount) {
      toast.error(`Máximo ${PORTFOLIO_LIMITS[type].maxCount} ${type}s`);
      return;
    }

    setUploading({ type, name: file.name });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const { url, size } = await uploadPortfolioFile(formData);
      const created = await createPortfolioItem({
        title: file.name.replace(/\.[^/.]+$/, ""),
        type,
        file_url: url,
        file_size: size,
      });

      setItems((prev) => [...prev, created]);
      toast.success(tc("misc.savedSuccessfully"));
    } catch (err) {
      console.error("Error uploading portfolio file:", err);
      toast.error(err instanceof Error ? err.message : tc("misc.error"));
    } finally {
      setUploading(null);
    }
  }

  /* ---- Delete ---- */
  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deletePortfolioItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(tc("misc.savedSuccessfully"));
    } catch (err) {
      console.error("Error deleting portfolio item:", err);
      toast.error(tc("misc.error"));
    } finally {
      setDeleting(null);
    }
  }

  /* ---- Edit dialog ---- */
  function openEdit(item: PortfolioItem) {
    setEditState({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      tags: item.tags,
      tagInput: "",
    });
  }

  async function handleSaveEdit() {
    if (!editState) return;
    setSaving(true);
    try {
      const updated = await updatePortfolioItem(editState.id, {
        title: editState.title,
        description: editState.description,
        tags: editState.tags,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditState(null);
      toast.success(tc("misc.savedSuccessfully"));
    } catch (err) {
      console.error("Error saving portfolio item:", err);
      toast.error(tc("misc.error"));
    } finally {
      setSaving(false);
    }
  }

  function addTag() {
    if (!editState) return;
    const tag = editState.tagInput.trim();
    if (!tag || editState.tags.includes(tag) || editState.tags.length >= 10) return;
    setEditState({ ...editState, tags: [...editState.tags, tag], tagInput: "" });
  }

  function removeTag(tag: string) {
    if (!editState) return;
    setEditState({ ...editState, tags: editState.tags.filter((t) => t !== tag) });
  }

  /* ---- Counts ---- */
  const counts = countByType(items);

  const UPLOAD_TYPES: { type: FileType; label: string; ref: React.RefObject<HTMLInputElement | null> }[] = [
    { type: "photo", label: t("profile.portfolio.photos"), ref: photoRef },
    { type: "video", label: t("profile.portfolio.videos"), ref: videoRef },
    { type: "document", label: t("profile.portfolio.documents"), ref: docRef },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload buttons row */}
      <div className="flex flex-wrap gap-3">
        {UPLOAD_TYPES.map(({ type, label, ref }) => {
          const limit = PORTFOLIO_LIMITS[type];
          const count = counts[type];
          const atLimit = count >= limit.maxCount;
          const Icon = typeIcon(type);

          return (
            <div key={type}>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2",
                  atLimit && "opacity-50 cursor-not-allowed"
                )}
                disabled={atLimit || uploading?.type === type}
                onClick={() => ref.current?.click()}
              >
                {uploading?.type === type ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Icon className="size-4" />
                    <Plus className="size-3" />
                  </>
                )}
                <span>{label}</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {count}/{limit.maxCount}
                </Badge>
              </Button>
              <input
                ref={ref}
                type="file"
                className="hidden"
                accept={typeAccept(type)}
                onChange={(e) => {
                  handleUpload(e.target.files, type);
                  e.target.value = "";
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Upload progress indicator */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700"
        >
          <Loader2 className="size-4 animate-spin" />
          <span>
            {t("profile.portfolio.uploading")} — {uploading.name}
          </span>
        </motion.div>
      )}

      {/* Empty state */}
      {items.length === 0 && !uploading && (
        <GlassCard hover={false} className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-100">
            <Upload className="size-6 text-brand-500" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("profile.portfolio.emptyTitle")}
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {t("profile.portfolio.emptyDescription")}
          </p>
        </GlassCard>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariant} exit={itemVariant.exit} layout>
                <PortfolioCard
                  item={item}
                  isDeleting={deleting === item.id}
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editState} onOpenChange={(open) => !open && setEditState(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.portfolio.editItem")}</DialogTitle>
          </DialogHeader>

          {editState && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {t("profile.portfolio.fieldTitle")}
                </label>
                <Input
                  value={editState.title}
                  onChange={(e) =>
                    setEditState({ ...editState, title: e.target.value })
                  }
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {t("profile.portfolio.fieldDescription")}
                </label>
                <Input
                  value={editState.description}
                  onChange={(e) =>
                    setEditState({ ...editState, description: e.target.value })
                  }
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {t("profile.portfolio.tags")}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={editState.tagInput}
                    onChange={(e) =>
                      setEditState({ ...editState, tagInput: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={t("profile.portfolio.addTag")}
                    maxLength={30}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    <Tag className="size-3.5" />
                  </Button>
                </div>
                {editState.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editState.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer gap-1 pr-1 text-xs"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="size-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditState(null)}>
              {tc("actions.cancel")}
            </Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              {tc("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Portfolio Card                                                     */
/* ------------------------------------------------------------------ */

interface PortfolioCardProps {
  item: PortfolioItem;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function PortfolioCard({ item, isDeleting, onEdit, onDelete }: PortfolioCardProps) {
  const Icon = typeIcon(item.type);

  return (
    <GlassCard hover className="group flex flex-col gap-3 p-4">
      {/* Preview / icon area */}
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
        {item.type === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.file_url}
            alt={item.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : item.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Icon className="size-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Action overlay */}
        <div className="absolute inset-0 flex items-end justify-end gap-1.5 bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            size="icon-xs"
            variant="secondary"
            className="size-7 backdrop-blur-sm"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="destructive"
            className="size-7"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>

        {/* Type badge */}
        <div className="absolute left-2 top-2">
          <Badge variant="secondary" className="gap-1 text-[10px] backdrop-blur-sm">
            <Icon className="size-3" />
            {item.type}
          </Badge>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5">
        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
        {item.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}
        <p className="text-[10px] text-muted-foreground">{formatFileSize(item.file_size)}</p>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
