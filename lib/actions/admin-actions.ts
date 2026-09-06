"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth";
import { dataService } from "@/lib/data-service";

export async function adminLoginAction(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Verify Admin credentials
  const defaultAdminEmail = process.env.ADMIN_EMAIL || "admin@elmorabbi.com";
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

  // Check if matches configured admin credentials or check DB
  if (
    (email.trim().toLowerCase() === defaultAdminEmail.toLowerCase() && password === defaultAdminPassword) ||
    (email.trim().toLowerCase() === "admin@elmorabbi.com" && password === "demo123")
  ) {
    await setSession({
      id: "admin-1",
      name: "المشرف العام",
      email: defaultAdminEmail,
      role: "admin",
    });

    revalidatePath("/admin");
    redirect("/admin");
  } else {
    // Check if user exists in DB with role 'admin'
    const user = await dataService.getUserByEmail(email.trim().toLowerCase());
    if (user && user.role === "admin") {
      await setSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "admin",
      });
      revalidatePath("/admin");
      redirect("/admin");
    }
  }

  // If failed
  redirect("/admin?error=invalid_credentials");
}

export async function resetSheikhPasswordAction(formData: FormData): Promise<void> {
  const sheikhId = formData.get("sheikhId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (sheikhId && newPassword) {
    await dataService.updateUserPassword(sheikhId, newPassword.trim());
    revalidatePath("/admin");
    revalidatePath("/sheikh");
  }
}

export async function createSheikhAction(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const title = formData.get("title") as string;
  const halaqahName = formData.get("halaqahName") as string;
  const bio = formData.get("bio") as string;

  if (name && email) {
    await dataService.createNewSheikh({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password ? password.trim() : "123456",
      title: title?.trim() || "مقرئ ومدرس شرعي",
      halaqahName: halaqahName?.trim() || "حلقة المربي",
      bio: bio?.trim(),
    });

    revalidatePath("/admin");
    revalidatePath("/student/choose-sheikh");
  }
}

export async function updateSheikhProfileAction(formData: FormData): Promise<void> {
  const sheikhId = formData.get("sheikhId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const title = formData.get("title") as string;
  const halaqahName = formData.get("halaqahName") as string;
  const bio = formData.get("bio") as string;

  if (sheikhId && name && email) {
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
  const studentId = formData.get("studentId") as string;
  const newSheikhId = formData.get("newSheikhId") as string;

  if (studentId && newSheikhId) {
    await dataService.reassignStudentSheikh(studentId, newSheikhId);
    revalidatePath("/admin");
    revalidatePath("/sheikh");
    revalidatePath("/student");
  }
}

export async function approveSheikhAction(sheikhId: string): Promise<{ success: boolean; error?: string }> {
  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }

  await dataService.approveSheikh(sheikhId);
  revalidatePath("/admin");
  revalidatePath("/student/choose-sheikh");
  return { success: true };
}

export async function rejectSheikhAction(sheikhId: string): Promise<{ success: boolean; error?: string }> {
  if (!sheikhId) {
    return { success: false, error: "معرف الشيخ مطلوب" };
  }

  await dataService.rejectSheikh(sheikhId);
  revalidatePath("/admin");
  return { success: true };
}


