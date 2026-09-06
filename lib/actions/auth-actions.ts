"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataService, UserRecord } from "../data-service";
import { setSession, clearSession } from "../auth";

export async function loginAction(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const expectedRole = (formData.get("role") as "student" | "sheikh") || "student";

  if (!email || !password) {
    redirect(`/login?error=missing_fields&role=${expectedRole}`);
  }

  const user = await dataService.getUserByEmail(email);
  if (!user) {
    redirect(`/login?error=invalid_credentials&role=${expectedRole}&email=${encodeURIComponent(email)}`);
  }

  // Password Verification (matches user's password or demo fallback)
  const isValidPassword =
    user.password === password ||
    password === "password123" ||
    password === "demo123";

  if (!isValidPassword) {
    redirect(`/login?error=invalid_credentials&role=${expectedRole}&email=${encodeURIComponent(email)}`);
  }

  // Check Role Mismatch
  if (expectedRole === "sheikh" && user.role === "student") {
    redirect(`/login?error=role_mismatch_student&role=student&email=${encodeURIComponent(email)}`);
  }

  if (expectedRole === "student" && user.role === "sheikh") {
    redirect(`/login?error=role_mismatch_sheikh&role=sheikh&email=${encodeURIComponent(email)}`);
  }

  // If Sheikh, verify platform approval status
  if (user.role === "sheikh") {
    if (user.status === "pending_approval") {
      redirect(`/login?error=pending_sheikh&role=sheikh&email=${encodeURIComponent(email)}`);
    }
    if (user.status === "rejected") {
      redirect(`/login?error=rejected_sheikh&role=sheikh&email=${encodeURIComponent(email)}`);
    }
  }

  // Set authenticated session
  await setSession(user);

  if (user.role === "sheikh") {
    redirect("/sheikh");
  } else if (user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/student");
  }
}

export async function registerAction(formData: FormData): Promise<void> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as "student" | "sheikh") || "student";
  const phone = (formData.get("phone") as string)?.trim();

  if (!name || !email || !password) {
    redirect(`/register?error=missing_fields&role=${role}`);
  }

  const existing = await dataService.getUserByEmail(email);
  if (existing) {
    redirect(`/register?error=email_exists&role=${role}&email=${encodeURIComponent(email)}`);
  }

  const title = (formData.get("title") as string)?.trim();
  const halaqahName = (formData.get("halaqahName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role,
    phone: phone || undefined,
    title: title || undefined,
    halaqahName: halaqahName || undefined,
    bio: bio || undefined,
  };

  await dataService.createUser(newUser);

  // If the registrant is a Sheikh, they must await admin approval
  if (role === "sheikh") {
    redirect(`/login?success=sheikh_pending&role=sheikh`);
  } else {
    // Students can immediately start their onboarding
    await setSession(newUser);
    redirect("/student/choose-sheikh");
  }
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function switchDemoUserAction(userId: string): Promise<void> {
  const user = await dataService.getUserById(userId);
  if (user) {
    await setSession(user);
    revalidatePath("/");
    revalidatePath("/student");
    revalidatePath("/sheikh");
    revalidatePath("/admin");

    if (user.role === "sheikh") {
      redirect("/sheikh");
    } else if (user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/student");
    }
  }
}
