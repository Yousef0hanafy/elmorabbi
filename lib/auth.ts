import { cookies } from "next/headers";
import { dataService, UserRecord } from "./data-service";

const SESSION_COOKIE_NAME = "elmorabbi_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "sheikh" | "admin";
  avatar?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const parsed = JSON.parse(sessionCookie.value) as SessionUser;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(user: UserRecord): Promise<void> {
  const cookieStore = await cookies();
  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function switchDemoUser(userId: string): Promise<UserRecord | null> {
  const user = await dataService.getUserById(userId);
  if (user) {
    await setSession(user);
    return user;
  }
  return null;
}
