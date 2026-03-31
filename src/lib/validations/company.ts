import { z } from "zod";

export const companyFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripcion no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  sector: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .url("Ingresa una URL valida (ej: https://ejemplo.com)")
    .optional()
    .or(z.literal("")),
  employees_count: z
    .number()
    .min(0, "El numero de empleados no puede ser negativo")
    .optional(),
  logo_gradient: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
