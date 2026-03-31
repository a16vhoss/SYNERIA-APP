"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.email("Ingresa un correo valido"),
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const { resetPassword, loading: isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      // Error handled in hook
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo size="md" />
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-card">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100"
              >
                <CheckCircle2 className="h-8 w-8 text-brand-600" />
              </motion.div>
              <h2 className="mb-2 font-heading text-xl font-bold">
                Revisa tu correo
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Te hemos enviado un enlace para restablecer tu contrasena.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Iniciar Sesion
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="mb-2 font-heading text-xl font-bold">
                Recuperar Contrasena
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Ingresa tu correo electronico y te enviaremos un enlace para
                restablecer tu contrasena.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo Electronico</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enviar enlace
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm text-brand-600 hover:underline"
                >
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
                  Volver a Iniciar Sesion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
