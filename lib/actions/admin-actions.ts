"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ENV_ADMIN_ID, requireRole, setSession } from "@/lib/auth";
import { dataService, DuplicateEmailError } from "@/lib/data-service";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isValidPassword, MIN_PASSWORD_LENGTH, SAVE_ERROR_MESSAGE } from "@/lib/validation";

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
      id: ENV_ADMIN_ID,
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

type ActionResult = { success: boolean; error?: string };

const DUPLICATE_EMAIL_MESSAGE = "هذا البريد الإلكتروني مستخدم لحساب آخر";
const WEAK_PASSWORD_MESSAGE = `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف`;

// Runs a write and converts failures into a user-facing error
async function runWrite(write: () => Promise<void>): Promise<ActionResult> {
  try {
    await write();
    return { success: true };
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return { success: false, error: DUPLICATE_EMAIL_MESSAGE };
    }
    console.error("Admin action failed:", err);
    return { success: false, error: SAVE_ERROR_MESSAGE };
  }
}

export async function resetSheikhPasswordAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin");

  const sheikhId = formData.get("sheikhId") as string | null;
  const newPassword = ((formData.get("newPassword") as string | null) ?? "").trim();

  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }
  if (!isValidPassword(newPassword)) {
    return { success: false, error: WEAK_PASSWORD_MESSAGE };
  }

  const passwordHash = await hashPassword(newPassword);
  const result = await runWrite(() => dataService.updateUserPassword(sheikhId, passwordHash));
  revalidatePath("/admin");
  return result;
}

export async function createSheikhAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin");

  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = ((formData.get("password") as string | null) ?? "").trim();
  const title = formData.get("title") as string | null;
  const halaqahName = formData.get("halaqahName") as string | null;
  const bio = formData.get("bio") as string | null;

  if (!name || !email) {
    return { success: false, error: "الاسم والبريد الإلكتروني مطلوبان" };
  }
  if (!isValidPassword(password)) {
    return { success: false, error: WEAK_PASSWORD_MESSAGE };
  }

  const passwordHash = await hashPassword(password);
  const result = await runWrite(() =>
    dataService.createNewSheikh({
      name,
      email,
      passwordHash,
      title: title?.trim() || "مقرئ ومدرس شرعي",
      halaqahName: halaqahName?.trim() || "حلقة المربي",
      bio: bio?.trim(),
    })
  );

  revalidatePath("/admin");
  revalidatePath("/student/choose-sheikh");
  return result;
}

export async function updateSheikhProfileAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin");

  const sheikhId = formData.get("sheikhId") as string | null;
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const title = formData.get("title") as string | null;
  const halaqahName = formData.get("halaqahName") as string | null;
  const bio = formData.get("bio") as string | null;

  if (!sheikhId || !name || !email) {
    return { success: false, error: "الاسم والبريد الإلكتروني مطلوبان" };
  }

  const result = await runWrite(() =>
    dataService.updateSheikhProfile(sheikhId, {
      name,
      email,
      title: title?.trim() || "مقرئ ومدرس شرعي",
      halaqahName: halaqahName?.trim() || "حلقة المربي",
      bio: bio?.trim(),
    })
  );

  revalidatePath("/admin");
  revalidatePath("/sheikh");
  revalidatePath("/student/choose-sheikh");
  return result;
}

export async function reassignStudentSheikhAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin");

  const studentId = formData.get("studentId") as string | null;
  const newSheikhId = formData.get("newSheikhId") as string | null;

  if (!studentId || !newSheikhId) {
    return { success: false, error: "يرجى اختيار الطالب والشيخ" };
  }

  const activeSheikhs = await dataService.getAllSheikhs();
  if (!activeSheikhs.some((s) => s.id === newSheikhId)) {
    return { success: false, error: "هذا الشيخ غير متاح حالياً" };
  }

  const result = await runWrite(() => dataService.reassignStudentSheikh(studentId, newSheikhId));
  revalidatePath("/admin");
  revalidatePath("/sheikh");
  revalidatePath("/student");
  return result;
}

export async function approveSheikhAction(sheikhId: string): Promise<ActionResult> {
  await requireRole("admin");

  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }

  const result = await runWrite(() => dataService.approveSheikh(sheikhId));
  revalidatePath("/admin");
  revalidatePath("/student/choose-sheikh");
  return result;
}

export async function rejectSheikhAction(sheikhId: string): Promise<ActionResult> {
  await requireRole("admin");

  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }

  const result = await runWrite(() => dataService.rejectSheikh(sheikhId));
  revalidatePath("/admin");
  return result;
}
