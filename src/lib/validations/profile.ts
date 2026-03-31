import { z } from "zod";

export const personalInfoSchema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  phone: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  bio: z
    .string()
    .max(500, "La biografia no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

export const experienceSchema = z.object({
  title: z
    .string()
    .min(2, "El titulo es requerido")
    .max(100, "El titulo no puede exceder 100 caracteres"),
  company: z
    .string()
    .min(2, "La empresa es requerida")
    .max(100, "La empresa no puede exceder 100 caracteres"),
  start_date: z.string().min(1, "La fecha de inicio es requerida"),
  end_date: z.string().optional().or(z.literal("")),
  description: z
    .string()
    .max(500, "La descripcion no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ExperienceValues = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  institution: z
    .string()
    .min(2, "La institucion es requerida")
    .max(100, "La institucion no puede exceder 100 caracteres"),
  degree: z
    .string()
    .min(2, "El titulo es requerido")
    .max(100, "El titulo no puede exceder 100 caracteres"),
  start_date: z.string().min(1, "La fecha de inicio es requerida"),
  end_date: z.string().optional().or(z.literal("")),
  description: z
    .string()
    .max(500, "La descripcion no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type EducationValues = z.infer<typeof educationSchema>;
