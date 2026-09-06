"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";
import {
  GraduationCap,
  UserCheck,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
} from "lucide-react";

interface LoginFormProps {
  initialRole?: "student" | "sheikh";
  initialEmail?: string;
  errorCode?: string;
  successCode?: string;
}

export function LoginForm({
  initialRole = "student",
  initialEmail = "",
  errorCode,
  successCode,
}: LoginFormProps) {
  const [role, setRole] = useState<"student" | "sheikh">(initialRole);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

  // Error message resolution
  let errorMessage: string | null = null;
  if (errorCode === "invalid_credentials") {
    errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.";
  } else if (errorCode === "role_mismatch_student") {
    errorMessage = "هذا الحساب مسجل كطالب. يرجى التبديل إلى تبويب (طالب) لتسجيل الدخول.";
  } else if (errorCode === "role_mismatch_sheikh") {
    errorMessage = "هذا الحساب مسجل كشيخ / معلم. يرجى التبديل إلى تبويب (معلم / شيخ).";
  } else if (errorCode === "pending_sheikh") {
    errorMessage = "طلب انضمامك كشيخ قيد المراجعة والاعتماد من قبل إدارة المنصة. سيتم تفعيل حسابك والتواصل معك قريباً.";
  } else if (errorCode === "rejected_sheikh") {
    errorMessage = "نعتذر، لم يتم اعتماد طلب الانضمام. يرجى التواصل مع إدارة المنصة للاستفسار.";
  } else if (errorCode === "missing_fields") {
    errorMessage = "يرجى ملء جميع الحقول المطلوبة (البريد وكلمة المرور).";
  }

  // Success message resolution
  let successMessage: string | null = null;
  if (successCode === "sheikh_pending") {
    successMessage = "تم استلام طلب انضمامك كشيخ بنجاح! طلبك الآن قيد مراجعة واعتماد الإدارة، وسيتم تفعيل حسابك قريباً بإذن الله.";
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xl relative overflow-hidden transition-all">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          role === "student" ? "bg-emerald-100/60" : "bg-amber-100/60"
        }`}
      />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold mx-auto mb-3 shadow-md transition-all duration-300 ${
            role === "student"
              ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/20"
              : "bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-amber-500/20"
          }`}
        >
          {role === "student" ? (
            <GraduationCap className="w-7 h-7" />
          ) : (
            <UserCheck className="w-7 h-7" />
          )}
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          تسجيل الدخول
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {role === "student"
            ? "أهلاً بك يا طالب العلم، سجّل لمتابعة أورادك اليومية"
            : "مرحباً بفضيلة الشيخ، سجّل لإدارة حلقتك وتوجيه طلابك"}
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          className={`mb-5 p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs animate-fadeIn ${
            errorCode === "pending_sheikh"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {errorCode === "pending_sheikh" ? (
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="mb-6 relative z-10">
        <label className="text-xs font-bold text-slate-700 block mb-2">
          حدد صفتك لتسجيل الدخول:
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === "student"
                ? "bg-white text-emerald-800 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>طالب</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("sheikh")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === "sheikh"
                ? "bg-white text-amber-900 shadow-sm border border-amber-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>معلم / شيخ</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form action={loginAction} className="space-y-4 relative z-10">
        <input type="hidden" name="role" value={role} />

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "student" ? "ahmed@student.com" : "sheikh@elmorabbi.com"}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-3 pr-10 pl-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            كلمة المرور
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-3 pr-10 pl-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
            role === "student"
              ? "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20"
              : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>
            {role === "student" ? "تسجيل الدخول كطالب" : "تسجيل الدخول كمعلم / شيخ"}
          </span>
        </button>
      </form>

      {/* Signup Redirection */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        ليس لديك حساب مسجل؟{" "}
        <Link
          href="/register"
          className={`font-bold hover:underline ${
            role === "student" ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          إنشاء حساب جديد
        </Link>
      </div>
    </div>
  );
}
