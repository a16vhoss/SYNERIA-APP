/**
 * Format a number as currency.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "es-ES"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string or Date object.
 */
export function formatDate(
  date: string | Date,
  locale: string = "es-ES",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date as relative time (e.g., "hace 2 horas").
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSec < 60) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
  if (diffWeeks < 4) return `Hace ${diffWeeks} ${diffWeeks === 1 ? "semana" : "semanas"}`;
  if (diffMonths < 12) return `Hace ${diffMonths} ${diffMonths === 1 ? "mes" : "meses"}`;

  return formatDate(d);
}

/**
 * Format a salary range.
 */
export function formatSalaryRange(
  min: number,
  max: number,
  currency: string = "USD"
): string {
  const fmtMin = formatCurrency(min, currency);
  const fmtMax = formatCurrency(max, currency);

  if (min === max) return fmtMin;
  return `${fmtMin} - ${fmtMax}`;
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
