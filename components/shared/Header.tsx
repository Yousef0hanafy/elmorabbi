import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/shared/Logo";
import { BookOpen, Sparkles, LogOut, Compass, Users, CheckCircle2, MessageCircleQuestion } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white border-b border-emerald-800/80 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Logo size="md" isLight={true} />
          </div>

          {/* Navigation Links based on role */}
          {session && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-emerald-100">
              {session.role === "student" && (
                <>
                  <Link
                    href="/student"
                    className="px-3 py-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ورد اليوم
                  </Link>
                  <Link
                    href="/student/sheikh"
                    className="px-3 py-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4 text-amber-300" />
                    معلمي والتوجيهات
                  </Link>
                  <Link
                    href="/student/choose-sheikh"
                    className="px-3 py-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5 text-xs text-emerald-300/80"
                  >
                    تغيير الشيخ
                  </Link>
                </>
              )}

              {session.role === "sheikh" && (
                <>
                  <Link
                    href="/sheikh"
                    className="px-3 py-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5 font-bold"
                  >
                    <Users className="w-4 h-4 text-amber-300" />
                    متابعة طلاب الحلقة
                  </Link>
                  <Link
                    href="/sheikh#inquiries"
                    className="px-3 py-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5 text-xs text-emerald-200"
                  >
                    <MessageCircleQuestion className="w-4 h-4 text-amber-400" />
                    استفسارات وأسئلة الطلاب
                  </Link>
                </>
              )}

              {session.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5 font-bold text-amber-300"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  لوحة الإدارة المركزية
                </Link>
              )}
            </nav>
          )}

          {/* Right side: Sheikh discreet access & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Discreet Sheikh entrance only for unauthenticated visitors */}
            {!session && (
              <Link
                href="/sheikh"
                className="text-xs text-emerald-200/90 hover:text-amber-300 px-2.5 py-1.5 rounded-lg hover:bg-emerald-800/50 transition-all flex items-center gap-1.5 border border-emerald-700/40"
                title="بوابة دخول المشايخ والمربين"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">بوابة المربين</span>
              </Link>
            )}

            {session ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-emerald-100 leading-tight">
                    {session.name}
                  </span>
                  <span className="text-[10px] text-amber-300">
                    {session.role === "sheikh"
                      ? "الشيخ المربي"
                      : session.role === "admin"
                      ? "مشرف المنصة"
                      : "طالب علم"}
                  </span>
                </div>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    title="تسجيل الخروج"
                    className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
