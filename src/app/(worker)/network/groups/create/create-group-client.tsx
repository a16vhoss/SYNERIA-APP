"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { createGroup } from "@/lib/actions/groups";
import { toast } from "sonner";

export function CreateGroupClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isPublic, setIsPublic] = useState(true);

  const isValid = name.trim().length >= 3 && category;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        is_public: isPublic,
      });
      toast.success("Grupo creado correctamente");
      router.push(`/network/groups/${group.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear el grupo");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Crear Grupo"
        subtitle="Crea una comunidad para conectar con profesionales"
      >
        <Button variant="ghost" size="sm" render={<Link href="/network/groups" />}>
          <ArrowLeft className="mr-2 size-4" />
          Volver
        </Button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {/* Icon preview */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-md">
                <Users className="size-8 text-white" />
              </div>
              <div>
                <p className="font-heading text-base font-semibold text-foreground">
                  {name.trim() || "Nombre del grupo"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {category
                    ? { sector: "Sector", country: "País", interest: "Interés" }[category]
                    : "Categoría"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="group-name">
                  Nombre del grupo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="group-name"
                  placeholder="Ej: Profesionales de salud en España"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {name.length}/80 caracteres
                </p>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="group-desc">Descripción</Label>
                <Textarea
                  id="group-desc"
                  placeholder="Describe de qué trata este grupo y a quién está dirigido..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/500 caracteres
                </p>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="group-category">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger id="group-category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sector">Sector profesional</SelectItem>
                    <SelectItem value="country">País</SelectItem>
                    <SelectItem value="interest">Interés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Public toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Grupo público
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cualquier usuario puede encontrar y unirse al grupo
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  aria-label="Grupo público"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creando grupo...
                  </>
                ) : (
                  "Crear Grupo"
                )}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
