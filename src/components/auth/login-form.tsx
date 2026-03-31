"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/hooks/useAuth";

type LoginFormValues = {
  email: string;
  password: string;
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export function LoginForm() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signInWithEmail, signInWithGoogle, signInWithLinkedIn, loading, error, clearError } =
    useAuth();

  const loginSchema = z.object({
    email: z.email(t("login.errorInvalid")),
    password: z.string().min(1, t("login.password")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    await signInWithEmail(data.email, data.password);
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {t("login.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("login.subtitle")}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <motion.div variants={fadeUp} className="space-y-2">
          <Label htmlFor="login-email">{t("login.email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              className="h-11 rounded-xl pl-10"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </motion.div>

        {/* Password */}
        <motion.div variants={fadeUp} className="space-y-2">
          <Label htmlFor="login-password">{t("login.password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder={t("login.passwordPlaceholder")}
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
        </motion.div>

        {/* Remember + Forgot */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            {t("login.rememberMe")}
          </label>
          <Link
            href="/reset-password"
            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            {t("login.forgotPassword")}
          </Link>
        </motion.div>

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
              t("login.submit")
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* OAuth */}
      <motion.div variants={fadeUp}>
        <OAuthButtons
          onGoogle={signInWithGoogle}
          onLinkedIn={signInWithLinkedIn}
          loading={loading}
        />
      </motion.div>
    </motion.div>
  );
}
