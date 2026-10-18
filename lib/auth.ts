import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { dataService, UserRecord } from "./data-service";

const SESSION_COOKIE_NAME = "elmorabbi_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 1 week

export type Role = "student" | "sheikh" | "admin";

// Session id of the admin defined by ADMIN_EMAIL / ADMIN_PASSWORD
export const ENV_ADMIN_ID = "admin-env";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (at least 32 characters) in production");
  }
  // Development-only fallback so the app runs locally without extra setup
  return new TextEncoder().encode("dev-only-insecure-session-secret-change-me");
}

const isRole = (value: unknown): value is Role =>
  value === "student" || value === "sheikh" || value === "admin";

// Verifies the signed session cookie and that the account still holds that role;
// memoized per request
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  // Read the key outside the try so a missing secret fails loudly instead of logging everyone out
  const key = getSecretKey();
  let session: SessionUser;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || !isRole(payload.role)) {
      return null;
    }
    session = {
      id: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "",
      email: typeof payload.email === "string" ? payload.email : "",
      role: payload.role,
      avatar: typeof payload.avatar === "string" ? payload.avatar : undefined,
    };
  } catch {
    return null;
  }

  // The bootstrap admin from environment variables has no database row
  if (session.role === "admin" && session.id === ENV_ADMIN_ID && process.env.ADMIN_EMAIL) {
    return session;
  }

  // Deleted accounts, role changes and sheikhs who are no longer approved lose access immediately
  const account = await dataService.getAccountState(session.id);
  if (!account || account.role !== session.role) {
    return null;
  }
  if (account.role === "sheikh" && account.sheikhStatus !== "active") {
    return null;
  }
  return session;
});

// Use in pages and Server Actions: redirects to the right login page when
// there is no session or the session role is not allowed
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    if (roles.includes("admin") && roles.length === 1) {
      redirect("/admin");
    }
    redirect(`/login?role=${roles.includes("sheikh") ? "sheikh" : "student"}`);
  }
  return session;
}

export async function setSession(user: Pick<UserRecord, "id" | "name" | "email" | "role" | "avatar">): Promise<void> {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.avatar ? { avatar: user.avatar } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
