import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Minimal in-memory admin session, replacing Supabase Auth while the site
 * runs on fake data (see src/lib/store.ts). Sessions live in a process-wide
 * Set, referenced by an httpOnly cookie — good enough for local/demo use,
 * not a real auth system. Swap for Supabase Auth alongside the rest of the
 * database wiring (see README).
 */

export const ADMIN_COOKIE_NAME = "ency_admin_session";

const DEFAULT_EMAIL = "admin@encypherist.local";
const DEFAULT_PASSWORD = "encypherist2k26";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || DEFAULT_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
export const usingDefaultCredentials = !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD;

const globalForAuth = globalThis as unknown as { __encySessions?: Map<string, string> };
const sessions: Map<string, string> =
  globalForAuth.__encySessions ?? (globalForAuth.__encySessions = new Map());

export function verifyCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
}

export function createSession(email: string): string {
  const token = randomUUID();
  sessions.set(token, email);
  return token;
}

export function getSessionEmail(token: string | undefined): string | null {
  if (!token) return null;
  return sessions.get(token) ?? null;
}

export function destroySession(token: string | undefined): void {
  if (token) sessions.delete(token);
}
