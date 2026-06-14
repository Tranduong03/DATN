/**
 * Reusable input validation utilities for SportConnect
 */

/**
 * Validates if the given string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if the given string is a valid Vietnamese phone number.
 * Supports standard 10-digit formats starting with 0 or +84:
 * 03, 05, 07, 08, 09 followed by 8 digits.
 */
export function isValidPhone(phone: string): boolean {
  // Normalize by removing spaces or special characters
  const normalized = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(0|\+84)?(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(normalized);
}

/**
 * Validates if the password meets the minimum security requirements.
 * Default: minimum 6 characters.
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validates if the full name is valid.
 * Must be at least 2 characters.
 */
export function isValidFullName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2;
}
