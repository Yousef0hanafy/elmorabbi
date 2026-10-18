"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, setSession } from "@/lib/auth";
import { dataService } from "@/lib/data-service";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isValidPassword } from "@/lib/validation";

export async function adminLoginAction(formData: FormData): Promise<void> {
  const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    redirect("/admin?error=invalid_credentials");
  }

  // Bootstrap admin from environment variables (no hard-coded defaults)
  const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD;

  if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
    await setSession({
      id: "admin-env",
      name: "المشرف العام",
      email: envAdminEmail,
      role: "admin",
    });
    revalidatePath("/admin");
    redirect("/admin");
  }

  // Admin accounts stored in the database
  const user = await dataService.getUserByEmail(email);
  if (user && user.role === "admin" && (await verifyPassword(password, user.password))) {
    await setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "admin",
    });
    revalidatePath("/admin");
    redirect("/admin");
  }

  redirect("/admin?error=invalid_credentials");
}

export async function resetSheikhPasswordAction(formData: FormData): Promise<void> {
  await requireRole("admin");

  const sheikhId = formData.get("sheikhId") as string | null;
  const newPassword = ((formData.get("newPassword") as string | null) ?? "").trim();

  if (sheikhId && isValidPassword(newPassword)) {
    await dataService.updateUserPassword(sheikhId, await hashPassword(newPassword));
    revalidatePath("/admin");
  }
}

export async function createSheikhAction(formData: FormData): Promise<void> {
  await requireRole("admin");

  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const password = ((formData.get("password") as string | null) ?? "").trim();
  const title = formData.get("title") as string | null;
  const halaqahName = formData.get("halaqahName") as string | null;
  const bio = formData.get("bio") as string | null;

  if (name?.trim() && email?.trim() && isValidPassword(password)) {
    await dataService.createNewSheikh({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      title: title?.trim() || "مقرئ ومدرس شرعي",
      halaqahName: halaqahName?.trim() || "حلقة المربي",
      bio: bio?.trim(),
    });

    revalidatePath("/admin");
    revalidatePath("/student/choose-sheikh");
  }
}

export async function updateSheikhProfileAction(formData: FormData): Promise<void> {
  await requireRole("admin");

  const sheikhId = formData.get("sheikhId") as string | null;
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const title = formData.get("title") as string | null;
  const halaqahName = formData.get("halaqahName") as string | null;
  const bio = formData.get("bio") as string | null;

  if (sheikhId && name?.trim() && email?.trim()) {
    await dataService.updateSheikhProfile(sheikhId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      title: title?.trim() || "مقرئ ومدرس شرعي",
      halaqahName: halaqahName?.trim() || "حلقة المربي",
      bio: bio?.trim(),
    });

    revalidatePath("/admin");
    revalidatePath("/sheikh");
    revalidatePath("/student/choose-sheikh");
  }
}

export async function reassignStudentSheikhAction(formData: FormData): Promise<void> {
  await requireRole("admin");

  const studentId = formData.get("studentId") as string | null;
  const newSheikhId = formData.get("newSheikhId") as string | null;

  if (!studentId || !newSheikhId) {
    return;
  }

  const activeSheikhs = await dataService.getAllSheikhs();
  if (!activeSheikhs.some((s) => s.id === newSheikhId)) {
    return;
  }

  await dataService.reassignStudentSheikh(studentId, newSheikhId);
  revalidatePath("/admin");
  revalidatePath("/sheikh");
  revalidatePath("/student");
}

export async function approveSheikhAction(sheikhId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }

  await dataService.approveSheikh(sheikhId);
  revalidatePath("/admin");
  revalidatePath("/student/choose-sheikh");
  return { success: true };
}

export async function rejectSheikhAction(sheikhId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole("admin");

  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }

  await dataService.rejectSheikh(sheikhId);
  revalidatePath("/admin");
  return { success: true };
}
