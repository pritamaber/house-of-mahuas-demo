import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Deliberately small demo auth: one admin, credentials from env, a signed httpOnly cookie.
 * Swap for Supabase Auth when this goes to production (see README).
 */

const COOKIE = "mahua_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const DEMO_EMAIL = "admin@mahuas.demo";
const DEMO_PASSWORD = "mahua123";

const adminEmail = () => (process.env.ADMIN_EMAIL || DEMO_EMAIL).trim().toLowerCase();
const adminPassword = () => process.env.ADMIN_PASSWORD || DEMO_PASSWORD;
const secret = () => process.env.ADMIN_SECRET || "mahuas-demo-secret-change-me";

/** True when no ADMIN_PASSWORD is configured, i.e. the published demo credentials still work. */
export function usingDemoCredentials(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export function demoCredentials() {
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

const digest = (s: string) => createHash("sha256").update(s).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function checkCredentials(email: string, password: string): boolean {
  // Evaluate both so timing doesn't reveal which one was wrong.
  const okEmail = safeEqual(email.trim().toLowerCase(), adminEmail());
  const okPassword = safeEqual(password, adminPassword());
  return okEmail && okPassword;
}

export async function startAdminSession(): Promise<void> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `v1.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [version, expires, signature] = token.split(".");
  if (version !== "v1" || !expires || !signature) return false;
  if (!safeEqual(signature, sign(`${version}.${expires}`))) return false;
  return Number(expires) > Date.now();
}

/** Call at the top of every admin page, server action and admin route handler. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
