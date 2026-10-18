"use server";

import { redirect } from "next/navigation";
import { dataService, DuplicateEmailError, UserRecord } from "../data-service";
import { setSession, clearSession } from "../auth";
import { hashPassword, verifyPassword } from "../password";
import { isValidPassword } from "../validation";
import { allowAttempt, isLoginBlocked, recordFailedLogin } from "../rate-limit";

export async function loginAction(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;
  const expectedRole = formData.get("role") === "sheikh" ? "sheikh" : "student";

  if (!email || !password) {
    redirect(`/login?error=missing_fields&role=${expectedRole}`);
  }

  if (await isLoginBlocked("login", email)) {
    redirect(`/login?error=too_many_attempts&role=${expectedRole}&email=${encodeURIComponent(email)}`);
  }

  const user = await dataService.getUserByEmail(email);
  const isValid = await verifyPassword(password, user?.password);

  if (!user || !isValid) {
    await recordFailedLogin("login", email);
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
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password");
  // Only students and sheikhs can self-register; admins are never created here
  const role = formData.get("role") === "sheikh" ? "sheikh" : "student";
  const phone = (formData.get("phone") as string | null)?.trim();

  if (!name || !email || !password) {
    redirect(`/register?error=missing_fields&role=${role}`);
  }

  if (!isValidPassword(password)) {
    redirect(`/register?error=weak_password&role=${role}`);
  }

  if (!(await allowAttempt("register"))) {
    redirect(`/register?error=too_many_attempts&role=${role}`);
  }

  const existing = await dataService.getUserByEmail(email);
  if (existing) {
    redirect(`/register?error=email_exists&role=${role}&email=${encodeURIComponent(email)}`);
  }

  const title = (formData.get("title") as string | null)?.trim();
  const halaqahName = (formData.get("halaqahName") as string | null)?.trim();
  const bio = (formData.get("bio") as string | null)?.trim();

  const newUser: UserRecord = {
    id: `user-${crypto.randomUUID()}`,
    name,
    email,
    password: await hashPassword(password),
    role,
    phone: phone || undefined,
    title: title || undefined,
    halaqahName: halaqahName || undefined,
    bio: bio || undefined,
  };

  let failure: "email_exists" | "server_error" | null = null;
  try {
    await dataService.createUser(newUser);
  } catch (err) {
    failure = err instanceof DuplicateEmailError ? "email_exists" : "server_error";
    if (failure === "server_error") console.error("Registration failed:", err);
  }
  // redirect() throws, so it must stay outside the try block
  if (failure) {
    redirect(`/register?error=${failure}&role=${role}`);
  }

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
