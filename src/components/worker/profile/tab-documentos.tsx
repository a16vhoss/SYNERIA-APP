"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Camera,
  Award,
  Upload,
  CheckCircle,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

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
}

const DOCUMENT_SLOTS: DocumentSlot[] = [
  { key: "passport", label: "Pasaporte", icon: FileText, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "cv", label: "Curriculum / CV", icon: FileText, accept: ".pdf,.doc,.docx" },
  { key: "certifications", label: "Certificaciones", icon: Award, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "photo", label: "Foto de Perfil", icon: Camera, accept: ".jpg,.jpeg,.png,.webp" },
];

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

export function TabDocumentos() {
  const [files, setFiles] = useState<Record<string, UploadedFile | null>>({
    passport: null,
    cv: null,
    certifications: null,
    photo: null,
  });

  function handleUpload(key: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const sizeKB = Math.round(file.size / 1024);
    const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    setFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, size: sizeLabel },
    }));
  }

  function handleRemove(key: string) {
    setFiles((prev) => ({ ...prev, [key]: null }));
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
        return (
          <motion.div key={slot.key} variants={cardVariant}>
            <DocumentCard
              slot={slot}
              uploaded={uploaded}
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
  onUpload: (files: FileList | null) => void;
  onRemove: () => void;
}

function DocumentCard({ slot, uploaded, onUpload, onRemove }: DocumentCardProps) {
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
            {uploaded ? "Archivo subido" : "Pendiente"}
          </p>
        </div>
      </div>

      {/* Upload area or file preview */}
      {uploaded ? (
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
        onChange={(e) => onUpload(e.target.files)}
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        {uploaded ? (
          <Button
            size="xs"
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            Reemplazar archivo
          </Button>
        ) : (
          <Button
            size="xs"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            Buscar archivo
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
