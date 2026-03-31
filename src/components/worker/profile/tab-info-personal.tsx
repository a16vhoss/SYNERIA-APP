"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { COUNTRIES } from "@/lib/constants/countries";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(5, "Telefono requerido"),
  country: z.string().min(1, "Selecciona un pais"),
  city: z.string().min(1, "Ciudad requerida"),
  dateOfBirth: z.string().min(1, "Fecha requerida"),
  bio: z.string().max(500, "Maximo 500 caracteres").optional().default(""),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TabInfoPersonalProps {
  defaultValues: PersonalInfoValues;
}

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
};

export function TabInfoPersonal({ defaultValues }: TabInfoPersonalProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultValues.country);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema) as any,
    defaultValues,
  });

  const bioValue = watch("bio") ?? "";

  async function onSubmit(data: PersonalInfoValues) {
    setSaving(true);
    setSaveMessage(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName.trim(),
          phone: data.phone,
          country: data.country,
          city: data.city,
          date_of_birth: data.dateOfBirth || null,
          bio: data.bio,
        })
        .eq("id", user.id);

      if (error) throw error;
      setSaveMessage({ type: "success", text: "Perfil actualizado correctamente" });
    } catch (err) {
      setSaveMessage({ type: "error", text: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        className="grid gap-5 sm:grid-cols-2"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Nombre completo */}
        <motion.div className="space-y-1.5" variants={fadeUp}>
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            placeholder="Tu nombre"
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div className="space-y-1.5" variants={fadeUp}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            readOnly
            className="cursor-not-allowed opacity-60"
            {...register("email")}
          />
        </motion.div>

        {/* Telefono */}
        <motion.div className="space-y-1.5" variants={fadeUp}>
          <Label htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            placeholder="+51 999 999 999"
            {...register("phone")}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </motion.div>

        {/* Pais */}
        <motion.div className="space-y-1.5" variants={fadeUp}>
          <Label>Pais</Label>
          <Select
            value={selectedCountry}
            onValueChange={(val) => {
              if (val) setSelectedCountry(val);
              setValue("country", val ?? "", { shouldValidate: true });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar pais" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country.message}</p>
          )}
        </motion.div>

        {/* Ciudad */}
        <motion.div className="space-y-1.5" variants={fadeUp}>
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            placeholder="Bogota"
            {...register("city")}
            aria-invalid={!!errors.city}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </motion.div>

        {/* Fecha de nacimiento */}
        <motion.div className="space-y-1.5" variants={fadeUp}>
          <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
          <Input
            id="dateOfBirth"
            type="date"
            placeholder="dd/mm/yyyy"
            {...register("dateOfBirth")}
            aria-invalid={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </motion.div>

        {/* Bio / Descripcion - full width */}
        <motion.div className="space-y-1.5 sm:col-span-2" variants={fadeUp}>
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio / Descripcion</Label>
            <span className="text-xs text-muted-foreground">
              {bioValue.length}/500
            </span>
          </div>
          <Textarea
            id="bio"
            rows={4}
            maxLength={500}
            placeholder="Cuentanos sobre ti..."
            {...register("bio")}
            aria-invalid={!!errors.bio}
          />
          {errors.bio && (
            <p className="text-xs text-destructive">{errors.bio.message}</p>
          )}
        </motion.div>
      </motion.div>

      {/* Save message */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </motion.div>
      )}

      {/* Buttons */}
      <motion.div
        className="mt-6 flex justify-end gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Actualizar Datos"}
        </Button>
      </motion.div>
    </form>
  );
}
