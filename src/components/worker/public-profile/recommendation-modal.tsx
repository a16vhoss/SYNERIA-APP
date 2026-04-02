"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createRecommendation } from "@/lib/actions/recommendations";
import { toast } from "sonner";

interface RecommendationModalProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientSkills: string[];
  onSuccess: () => void;
}

const RELATIONSHIPS = [
  { value: "coworker", label: "Compañero de trabajo" },
  { value: "same_project", label: "Mismo proyecto" },
  { value: "same_sector", label: "Mismo sector" },
  { value: "acquaintance", label: "Conocido" },
] as const;

const MIN_LENGTH = 20;
const MAX_LENGTH = 500;
const MAX_SKILLS = 5;

export function RecommendationModal({
  open,
  onClose,
  recipientId,
  recipientName,
  recipientSkills,
  onSuccess,
}: RecommendationModalProps) {
  const [relationship, setRelationship] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      if (prev.length >= MAX_SKILLS) {
        toast.info(`Máximo ${MAX_SKILLS} habilidades`);
        return prev;
      }
      return [...prev, skill];
    });
  };

  const isValid =
    relationship !== "" &&
    content.length >= MIN_LENGTH &&
    content.length <= MAX_LENGTH;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await createRecommendation({
        recipient_id: recipientId,
        relationship,
        content,
        highlighted_skills: selectedSkills,
      });
      toast.success("Recomendación enviada con éxito");
      onSuccess();
      onClose();
      // Reset
      setRelationship("");
      setSelectedSkills([]);
      setContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al enviar la recomendación";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recomendar a {recipientName}</DialogTitle>
          <DialogDescription>
            Escribe una recomendación profesional. Será visible en su perfil público.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Relationship selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              ¿Cómo le conoces?
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={relationship === value ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  onClick={() => setRelationship(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills selector */}
          {recipientSkills.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Habilidades destacadas{" "}
                <span className="font-normal text-muted-foreground">
                  (máx. {MAX_SKILLS})
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {recipientSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer select-none transition-colors"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Tu recomendación
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
              placeholder={`Describe las fortalezas y habilidades de ${recipientName}...`}
              rows={5}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">
              {content.length}/{MAX_LENGTH} caracteres
              {content.length < MIN_LENGTH && content.length > 0 && (
                <span className="ml-2 text-yellow-500">
                  (mínimo {MIN_LENGTH})
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || submitting}>
              {submitting ? "Enviando..." : "Enviar recomendación"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
