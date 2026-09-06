import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@/components/shared/Logo";

interface RegisterPageProps {
  searchParams: Promise<{
    error?: string;
    role?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const initialRole = params.role === "sheikh" ? "sheikh" : "student";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8faf9] px-4 py-12 font-sans" dir="rtl">
      <Logo size="md" isLight={false} className="mb-6" />
      <RegisterForm
        errorCode={params.error}
        initialRole={initialRole}
      />
    </div>
  );
}
