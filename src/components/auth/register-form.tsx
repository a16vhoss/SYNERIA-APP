"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Globe } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PasswordStrengthIndicator } from "@/components/shared/password-strength-indicator";
import { RoleSelector } from "@/components/auth/role-selector";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/hooks/useAuth";
import { COUNTRIES } from "@/lib/constants/countries";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.email("Ingresa un correo valido"),
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contrasena"),
    country: z.string().min(1, "Selecciona un pais"),
    terms: z.literal(true, {
      error: "Debes aceptar los terminos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function RegisterForm() {
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const {
    signUpWithEmail,
    signInWithGoogle,
    signInWithLinkedIn,
    loading,
    error,
    clearError,
  } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      terms: false as unknown as true,
    },
  });

  const passwordValue = watch("password");
  const termsValue = watch("terms");
  const countryValue = watch("country");

  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    const result = await signUpWithEmail({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role,
      country: data.country,
    });
    if (result?.confirmEmail) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center space-y-4 py-8 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-brand-100">
          <Mail className="size-8 text-brand-600" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Verifica tu correo
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Hemos enviado un enlace de verificacion a tu correo electronico. Revisa
          tu bandeja de entrada para activar tu cuenta.
        </p>
        <button
          type="button"
          onClick={() => setEmailSent(false)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Volver al registro
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Crea tu cuenta
        </h2>
        <p className="text-sm text-muted-foreground">
          Unete a miles de profesionales y empresas en Syneria
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Role Selector */}
      <motion.div variants={fadeUp}>
        <RoleSelector value={role} onChange={setRole} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.form
          key={role}
          initial={{ opacity: 0, x: role === "worker" ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: role === "worker" ? 10 : -10 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Full Name */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label htmlFor="register-name">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-name"
                type="text"
                placeholder="Tu nombre completo"
                className="h-11 rounded-xl pl-10"
                {...register("fullName")}
                aria-invalid={!!errors.fullName}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label htmlFor="register-email">Correo electronico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-email"
                type="email"
                placeholder="tu@correo.com"
                className="h-11 rounded-xl pl-10"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label htmlFor="register-password">Contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimo 8 caracteres"
                className="h-11 rounded-xl pl-10 pr-10"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            <PasswordStrengthIndicator password={passwordValue || ""} />
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label htmlFor="register-confirm">Confirmar contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="register-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repite tu contrasena"
                className="h-11 rounded-xl pl-10 pr-10"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </motion.div>

          {/* Country */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label>Pais</Label>
            <Select
              value={countryValue}
              onValueChange={(val) =>
                val && setValue("country", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-11 w-full rounded-xl pl-10">
                <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <SelectValue placeholder="Selecciona tu pais" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-destructive">
                {errors.country.message}
              </p>
            )}
          </motion.div>

          {/* Terms */}
          <motion.div variants={fadeUp} className="flex items-start gap-2">
            <Checkbox
              id="register-terms"
              checked={termsValue}
              onCheckedChange={(checked) =>
                setValue("terms", checked === true ? true : (false as unknown as true), {
                  shouldValidate: true,
                })
              }
              className="mt-0.5"
            />
            <label
              htmlFor="register-terms"
              className="cursor-pointer text-sm leading-snug text-muted-foreground"
            >
              Acepto los{" "}
              <Link
                href="/terms"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Terminos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacy"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Politica de Privacidad
              </Link>
            </label>
          </motion.div>
          {errors.terms && (
            <p className="text-xs text-destructive">{errors.terms.message}</p>
          )}

          {/* Submit */}
          <motion.div variants={fadeUp}>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Crear Cuenta"
              )}
            </motion.button>
          </motion.div>

          {/* OAuth */}
          <motion.div variants={fadeUp}>
            <OAuthButtons
              onGoogle={signInWithGoogle}
              onLinkedIn={signInWithLinkedIn}
              loading={loading}
            />
          </motion.div>
        </motion.form>
      </AnimatePresence>
    </motion.div>
  );
}
