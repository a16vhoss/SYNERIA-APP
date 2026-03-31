"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: "worker" | "employer";
  country: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const clearError = useCallback(() => setError(null), []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;

        // Fetch role to redirect correctly
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          const dest =
            profile?.role === "employer" ? "/employer/dashboard" : "/dashboard";
          router.push(dest);
          router.refresh();
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al iniciar sesion";
        setError(
          message === "Invalid login credentials"
            ? "Credenciales invalidas. Verifica tu correo y contrasena."
            : message
        );
      } finally {
        setLoading(false);
      }
    },
    [supabase, router]
  );

  const signUpWithEmail = useCallback(
    async (data: SignUpData) => {
      setLoading(true);
      setError(null);
      try {
        const { error: authError, data: authData } =
          await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                role: data.role,
                country: data.country,
              },
            },
          });
        if (authError) throw authError;

        // If email confirmation is required
        if (authData.user && !authData.session) {
          return { confirmEmail: true };
        }

        // Auto-confirmed: redirect
        if (authData.session) {
          const dest =
            data.role === "employer" ? "/employer/dashboard" : "/dashboard";
          router.push(dest);
          router.refresh();
        }

        return { confirmEmail: false };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al crear la cuenta";
        setError(
          message === "User already registered"
            ? "Este correo ya esta registrado. Intenta iniciar sesion."
            : message
        );
        return { confirmEmail: false };
      } finally {
        setLoading(false);
      }
    },
    [supabase, router]
  );

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error con Google"
      );
      setLoading(false);
    }
  }, [supabase]);

  const signInWithLinkedIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error con LinkedIn"
      );
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al cerrar sesion"
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  const resetPassword = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);
      try {
        const { error: authError } =
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
          });
        if (authError) throw authError;
        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al enviar el enlace de recuperacion"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    loading,
    error,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
    resetPassword,
  };
}
