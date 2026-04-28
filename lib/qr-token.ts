import crypto from "crypto";

/**
 * Generates a unique secure token for a QR session
 */
export function generateQRToken(): string {
  return crypto.randomUUID();
}

/**
 * Validates a QR token format (basic UUID check)
 */
export function isValidTokenFormat(token: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}
