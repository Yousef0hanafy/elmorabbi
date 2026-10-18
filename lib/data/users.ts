import "server-only";

import { getDb, schema } from "@/db";
import { eq, and, desc, or, isNull } from "drizzle-orm";
import { formatTimestamp } from "../dates";
import type { UserRecord } from "./types";
import { assertEmailAvailable, SHEIKH_DEFAULTS } from "./shared";

export const userQueries = {
  // Users
  getAllSheikhs: async (): Promise<UserRecord[]> => {
    const rows = await getDb()
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        phone: schema.users.phone,
        title: schema.sheikhProfiles.title,
        bio: schema.sheikhProfiles.bio,
        halaqahName: schema.sheikhProfiles.halaqahName,
        status: schema.sheikhProfiles.status,
      })
      .from(schema.users)
      .leftJoin(schema.sheikhProfiles, eq(schema.users.id, schema.sheikhProfiles.userId))
      .where(
        and(
          eq(schema.users.role, "sheikh"),
          or(eq(schema.sheikhProfiles.status, "active"), isNull(schema.sheikhProfiles.status))
        )
      );

    return rows.map((r) => ({
      ...r,
      role: "sheikh" as const,
      avatar: r.avatar ?? undefined,
      phone: r.phone ?? undefined,
      title: r.title ?? SHEIKH_DEFAULTS.title,
      bio: r.bio ?? "",
      halaqahName: r.halaqahName ?? SHEIKH_DEFAULTS.halaqahName,
      status: "active" as const,
    }));
  },

  getPendingSheikhs: async (): Promise<UserRecord[]> => {
    const rows = await getDb()
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        phone: schema.users.phone,
        createdAt: schema.users.createdAt,
        title: schema.sheikhProfiles.title,
        bio: schema.sheikhProfiles.bio,
        halaqahName: schema.sheikhProfiles.halaqahName,
      })
      .from(schema.users)
      .innerJoin(schema.sheikhProfiles, eq(schema.users.id, schema.sheikhProfiles.userId))
      .where(and(eq(schema.users.role, "sheikh"), eq(schema.sheikhProfiles.status, "pending_approval")))
      .orderBy(desc(schema.users.createdAt));

    return rows.map((r) => ({
      ...r,
      role: "sheikh" as const,
      avatar: r.avatar ?? undefined,
      phone: r.phone ?? undefined,
      title: r.title ?? SHEIKH_DEFAULTS.title,
      bio: r.bio ?? "",
      halaqahName: r.halaqahName ?? SHEIKH_DEFAULTS.halaqahName,
      status: "pending_approval" as const,
      createdAt: formatTimestamp(r.createdAt, { day: "numeric", month: "short", year: "numeric" }),
    }));
  },

  approveSheikh: async (sheikhId: string): Promise<void> => {
    await getDb()
      .update(schema.sheikhProfiles)
      .set({ status: "active", isAcceptingStudents: true })
      .where(eq(schema.sheikhProfiles.userId, sheikhId));
  },

  rejectSheikh: async (sheikhId: string): Promise<void> => {
    await getDb()
      .update(schema.sheikhProfiles)
      .set({ status: "rejected", isAcceptingStudents: false })
      .where(eq(schema.sheikhProfiles.userId, sheikhId));
  },

  getUserById: async (id: string): Promise<UserRecord | undefined> => {
    const db = getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (!u) return undefined;

    let extra: Pick<UserRecord, "title" | "bio" | "halaqahName"> = {};
    if (u.role === "sheikh") {
      const [sp] = await db
        .select()
        .from(schema.sheikhProfiles)
        .where(eq(schema.sheikhProfiles.userId, u.id));
      if (sp) {
        extra = { title: sp.title, bio: sp.bio ?? undefined, halaqahName: sp.halaqahName };
      }
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar ?? undefined,
      phone: u.phone ?? undefined,
      ...extra,
    };
  },

  getUserByEmail: async (email: string): Promise<UserRecord | undefined> => {
    const db = getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    if (!u) return undefined;

    let extra: Pick<UserRecord, "title" | "bio" | "halaqahName" | "status"> = { status: "active" };
    if (u.role === "sheikh") {
      const [sp] = await db
        .select()
        .from(schema.sheikhProfiles)
        .where(eq(schema.sheikhProfiles.userId, u.id));
      if (sp) {
        extra = {
          title: sp.title,
          bio: sp.bio ?? undefined,
          halaqahName: sp.halaqahName,
          status: sp.status,
        };
      }
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      avatar: u.avatar ?? undefined,
      phone: u.phone ?? undefined,
      ...extra,
    };
  },

  // Current role and (for sheikhs) approval status, used to validate sessions on every request
  getAccountState: async (
    userId: string
  ): Promise<{ role: UserRecord["role"]; sheikhStatus: string | null } | undefined> => {
    const [row] = await getDb()
      .select({ role: schema.users.role, sheikhStatus: schema.sheikhProfiles.status })
      .from(schema.users)
      .leftJoin(schema.sheikhProfiles, eq(schema.users.id, schema.sheikhProfiles.userId))
      .where(eq(schema.users.id, userId));
    return row;
  },

  createUser: async (user: UserRecord): Promise<UserRecord> => {
    const db = getDb();
    await assertEmailAvailable(user.email);
    await db.insert(schema.users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? "",
      role: user.role,
      phone: user.phone,
    });

    if (user.role === "student") {
      await db.insert(schema.studentProfiles).values({
        id: `sp-${user.id}`,
        userId: user.id,
        level: "طالب جديد",
        status: "active",
      });
    } else if (user.role === "sheikh") {
      await db.insert(schema.sheikhProfiles).values({
        id: `shp-${user.id}`,
        userId: user.id,
        title: user.title || SHEIKH_DEFAULTS.title,
        bio: user.bio || "",
        isAcceptingStudents: false,
        halaqahName: user.halaqahName || `حلقة الشيخ ${user.name}`,
        status: "pending_approval",
      });
    }
    return user;
  },

  // Admin & Security Management
  updateUserPassword: async (userId: string, passwordHash: string): Promise<void> => {
    await getDb().update(schema.users).set({ password: passwordHash }).where(eq(schema.users.id, userId));
  },

  createNewSheikh: async (data: {
    name: string;
    email: string;
    passwordHash: string;
    title: string;
    halaqahName: string;
    bio?: string;
  }): Promise<void> => {
    const db = getDb();
    await assertEmailAvailable(data.email);
    const id = `sheikh-${crypto.randomUUID()}`;

    await db.insert(schema.users).values({
      id,
      name: data.name,
      email: data.email,
      password: data.passwordHash,
      role: "sheikh",
    });

    await db.insert(schema.sheikhProfiles).values({
      id: `shp-${id}`,
      userId: id,
      title: data.title,
      bio: data.bio || "",
      halaqahName: data.halaqahName,
      isAcceptingStudents: true,
      status: "active",
    });
  },

  // Update Sheikh Profile
  updateSheikhProfile: async (
    sheikhId: string,
    data: { name: string; email: string; title: string; halaqahName: string; bio?: string }
  ): Promise<void> => {
    const db = getDb();
    await assertEmailAvailable(data.email, sheikhId);
    await db
      .update(schema.users)
      .set({ name: data.name, email: data.email })
      .where(eq(schema.users.id, sheikhId));
    await db
      .update(schema.sheikhProfiles)
      .set({ title: data.title, halaqahName: data.halaqahName, bio: data.bio || "" })
      .where(eq(schema.sheikhProfiles.userId, sheikhId));
  },
};
