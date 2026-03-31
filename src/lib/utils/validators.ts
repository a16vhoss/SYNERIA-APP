/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validate a URL.
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate a phone number (international format, flexible).
 */
export function isValidPhone(phone: string): boolean {
  // Accepts: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const cleaned = phone.replace(/[\s\-().]/g, "");
  const re = /^\+?\d{7,15}$/;
  return re.test(cleaned);
}

/**
 * Validate that a file is within the allowed size (in megabytes).
 */
export function isFileSizeValid(file: File, maxMB: number): boolean {
  const maxBytes = maxMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate that a file has an allowed MIME type.
 */
export function isFileTypeValid(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}
