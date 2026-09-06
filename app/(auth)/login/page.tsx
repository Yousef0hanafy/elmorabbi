import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/shared/Logo";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    success?: string;
    role?: string;
    email?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const initialRole =
    params.role === "sheikh" ? "sheikh" : "student";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8faf9] px-4 py-12 font-sans" dir="rtl">
      <Logo size="md" isLight={false} className="mb-6" />
      <LoginForm
        initialRole={initialRole}
        initialEmail={params.email || ""}
        errorCode={params.error}
        successCode={params.success}
      />
    </div>
  );
}
