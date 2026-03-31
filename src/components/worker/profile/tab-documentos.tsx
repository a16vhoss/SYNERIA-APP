"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Camera,
  Award,
  Upload,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DocumentSlot {
  key: string;
  label: string;
  icon: LucideIcon;
  accept: string;
}

interface UploadedFile {
  name: string;
  size: string;
  url?: string;
}

const DOCUMENT_SLOTS: DocumentSlot[] = [
  { key: "passport", label: "Pasaporte", icon: FileText, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "cv", label: "Curriculum / CV", icon: FileText, accept: ".pdf,.doc,.docx" },
  { key: "certifications", label: "Certificaciones", icon: Award, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "photo", label: "Foto de Perfil", icon: Camera, accept: ".jpg,.jpeg,.png,.webp" },
];

const BUCKET_NAME = "documents";

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TabDocumentosProps {
  onAvatarChange?: (url: string) => void;
}

export function TabDocumentos({ onAvatarChange }: TabDocumentosProps = {}) {
  const [files, setFiles] = useState<Record<string, UploadedFile | null>>({
    passport: null,
    cv: null,
    certifications: null,
    photo: null,
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize storage bucket + load existing documents on mount
  useEffect(() => {
    // Ensure storage bucket exists
    fetch("/api/storage/init", { method: "POST" }).catch(() => {});

    async function loadDocuments() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("documents")
        .eq("id", user.id)
        .single();

      if (profile?.documents && typeof profile.documents === "object") {
        const docs = profile.documents as Record<string, { name: string; size: string; url: string }>;
        const loaded: Record<string, UploadedFile | null> = {
          passport: null,
          cv: null,
          certifications: null,
          photo: null,
        };
        for (const key of Object.keys(loaded)) {
          if (docs[key]) {
            loaded[key] = docs[key];
          }
        }
        setFiles(loaded);
      }
    }
    loadDocuments();
  }, []);

  async function handleUpload(key: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !userId) return;
    const file = fileList[0];
    const sizeKB = Math.round(file.size / 1024);
    const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    setUploading((prev) => ({ ...prev, [key]: true }));

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filePath = `${userId}/${key}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: sizeLabel,
        url: urlData.publicUrl,
      };

      const newFiles = { ...files, [key]: uploadedFile };
      setFiles(newFiles);

      // Save document metadata to profile
      const docsToSave: Record<string, UploadedFile> = {};
      for (const [k, v] of Object.entries(newFiles)) {
        if (v) docsToSave[k] = v;
      }

      // If this is a profile photo, also update avatar_url
      const updateData: Record<string, unknown> = { documents: docsToSave };
      if (key === "photo") {
        updateData.avatar_url = urlData.publicUrl;
        onAvatarChange?.(urlData.publicUrl);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Documento subido correctamente");
    } catch (err) {
      console.error("Error uploading document:", err);
      toast.error(
        `Error al subir documento: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleRemove(key: string) {
    if (!userId) return;

    try {
      const supabase = createClient();

      // Remove from storage (try common extensions)
      for (const ext of ["pdf", "jpg", "jpeg", "png", "doc", "docx", "webp"]) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([`${userId}/${key}.${ext}`]);
      }

      const newFiles = { ...files, [key]: null };
      setFiles(newFiles);

      // Update profile
      const docsToSave: Record<string, UploadedFile> = {};
      for (const [k, v] of Object.entries(newFiles)) {
        if (v) docsToSave[k] = v;
      }

      await supabase
        .from("profiles")
        .update({ documents: docsToSave })
        .eq("id", userId);

    } catch (err) {
      console.error("Error removing document:", err);
    }
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {DOCUMENT_SLOTS.map((slot) => {
        const uploaded = files[slot.key];
        const isUploading = uploading[slot.key] ?? false;
        return (
          <motion.div key={slot.key} variants={cardVariant}>
            <DocumentCard
              slot={slot}
              uploaded={uploaded}
              uploading={isUploading}
              onUpload={(fileList) => handleUpload(slot.key, fileList)}
              onRemove={() => handleRemove(slot.key)}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Document Card                                                      */
/* ------------------------------------------------------------------ */

interface DocumentCardProps {
  slot: DocumentSlot;
  uploaded: UploadedFile | null;
  uploading: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: () => void;
}

function DocumentCard({ slot, uploaded, uploading, onUpload, onRemove }: DocumentCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = slot.icon;

  return (
    <GlassCard hover={false} className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Icon className="size-5" />
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold text-foreground">
            {slot.label}
          </h4>
          <p className="text-xs text-muted-foreground">
            {uploading ? "Subiendo..." : uploaded ? "Archivo subido" : "Pendiente"}
          </p>
        </div>
      </div>

      {/* Upload area or file preview */}
      {uploading ? (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/50 px-4 py-5">
          <Loader2 className="size-5 animate-spin text-brand-500" />
          <span className="ml-2 text-xs font-medium text-brand-600">Subiendo archivo...</span>
        </div>
      ) : uploaded ? (
        <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-brand-500" />
            <div>
              <p className="text-xs font-medium text-foreground truncate max-w-[160px]">
                {uploaded.name}
              </p>
              <p className="text-xs text-muted-foreground">{uploaded.size}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onRemove}>
            <X className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border px-4 py-5",
            "text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50/50"
          )}
        >
          <Upload className="size-5" />
          <span className="text-xs font-medium">Subir archivo</span>
          <span className="text-[10px]">Arrastra o haz click</span>
        </button>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={slot.accept}
        onChange={(e) => {
          onUpload(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        {uploaded ? (
          <Button
            size="xs"
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Reemplazar archivo
          </Button>
        ) : (
          <Button
            size="xs"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Buscar archivo
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
