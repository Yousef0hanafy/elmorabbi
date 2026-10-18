import "server-only";

import { headers } from "next/headers";

// Fixed-window limiter kept in this server process's memory. It protects a single
// instance; on multi-instance or serverless hosting, swap the store for a shared one
// (e.g. Redis/Upstash) behind the same `consume` signature.

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();
const MAX_KEYS = 10_000;

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

// Failed logins per client IP and per account email
export const AUTH_RULE: RateLimitRule = { limit: 10, windowMs: 15 * 60 * 1000 };
// New accounts per client IP
export const REGISTER_RULE: RateLimitRule = { limit: 20, windowMs: 60 * 60 * 1000 };

function activeWindow(key: string, now: number): Window | undefined {
  const current = store.get(key);
  return current && current.resetAt > now ? current : undefined;
}

function hit(key: string, rule: RateLimitRule, now = Date.now()): number {
  const current = activeWindow(key, now);
  if (current) {
    current.count++;
    return current.count;
  }
  if (store.size >= MAX_KEYS) {
    // Drop expired windows before the map grows unbounded
    for (const [k, w] of store) if (w.resetAt <= now) store.delete(k);
  }
  store.set(key, { count: 1, resetAt: now + rule.windowMs });
  return 1;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

async function keysFor(action: string, email: string | undefined): Promise<string[]> {
  const keys = [`${action}:ip:${await clientIp()}`];
  if (email) keys.push(`${action}:email:${email}`);
  return keys;
}

// Login: only failed attempts count, so normal use never locks anyone out
export async function isLoginBlocked(action: string, email: string, rule = AUTH_RULE): Promise<boolean> {
  const now = Date.now();
  return (await keysFor(action, email)).some((k) => (activeWindow(k, now)?.count ?? 0) >= rule.limit);
}

export async function recordFailedLogin(action: string, email: string, rule = AUTH_RULE): Promise<void> {
  for (const key of await keysFor(action, email)) hit(key, rule);
}

// Registration: every attempt counts, per client IP
export async function allowAttempt(action: string, rule = REGISTER_RULE): Promise<boolean> {
  const [ipKey] = await keysFor(action, undefined);
  return hit(ipKey, rule) <= rule.limit;
}
