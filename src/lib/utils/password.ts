export const PASSWORD_MIN_LENGTH = 8;

export type PasswordStrength = "debil" | "media" | "fuerte";

export function calculatePasswordStrength(password: string): {
  level: PasswordStrength;
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "debil", score, label: "Debil" };
  if (score <= 4) return { level: "media", score, label: "Media" };
  return { level: "fuerte", score, label: "Fuerte" };
}
