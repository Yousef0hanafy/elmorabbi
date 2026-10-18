"use client";

import { useState } from "react";
import Link from "next/link";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";
import { registerAction } from "@/lib/actions/auth-actions";
import {
  GraduationCap,
  UserCheck,
  UserPlus,
  AlertCircle,
  Clock,
  Mail,
  Lock,
  User,
  Phone,
} from "lucide-react";

interface RegisterFormProps {
  errorCode?: string;
  initialRole?: "student" | "sheikh";
}

export function RegisterForm({
  errorCode,
  initialRole = "student",
}: RegisterFormProps) {
  const [role, setRole] = useState<"student" | "sheikh">(initialRole);

  let errorMessage: string | null = null;
  if (errorCode === "email_exists") {
    errorMessage = "البريد الإلكتروني مسجل بالفعل لدينا. يرجى تسجيل الدخول أو استخدام بريد آخر.";
  } else if (errorCode === "missing_fields") {
    errorMessage = "يرجى ملء جميع الحقول الإلزامية.";
  } else if (errorCode === "server_error") {
    errorMessage = "تعذر إنشاء الحساب حالياً، يرجى المحاولة مرة أخرى.";
  } else if (errorCode === "weak_password") {
    errorMessage = `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف.`;
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6">
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
          إنشاء حساب جديد
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {role === "student"
            ? "انضم كطالب علم لبناء وردك ومحاسبة نفسك بإشراف شيخ مربٍ"
            : "انضم كشيخ مربٍ لإنشاء حلقتك وإرشاد طلابك وتزكيتهم"}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Role Selection */}
      <div className="mb-5">
        <label className="text-xs font-bold text-slate-700 block mb-2">
          أنا أنضم كـ:
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
            <span>طالب علم</span>
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
            <span>شيخ / معلم</span>
          </button>
        </div>
      </div>

      {/* Sheikh Approval Notice */}
      {role === "sheikh" && (
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5 animate-fadeIn">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">تنويه لفضيلة الشيخ:</span> تخضع طلبات انضمام المشايخ لمراجعة واعتماد إدارة المنصة لضمان جودة الحلقات، وسيتم تفعيل حسابك فور الموافقة.
          </p>
        </div>
      )}

      {/* Registration Form */}
      <form action={registerAction} className="space-y-3.5">
        <input type="hidden" name="role" value={role} />

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            الاسم الكامل
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              name="name"
              type="text"
              required
              placeholder={role === "student" ? "مثال: عبد الله بن محمد" : "مثال: الشيخ عبد الرحمن الأحمد"}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-3 pr-10 pl-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

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
              placeholder="name@example.com"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-3 pr-10 pl-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            رقم الجوال (اختياري)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              name="phone"
              type="tel"
              placeholder="+2011x xxx xxxx"
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
              <Lock className="w-4 h-4" />
            </div>
            <input
              name="password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-3 pr-10 pl-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Additional Sheikh Specific Fields */}
        {role === "sheikh" && (
          <div className="space-y-3.5 pt-2 border-t border-slate-100 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                اللقب العلمي أو التخصص (اختياري)
              </label>
              <input
                name="title"
                type="text"
                placeholder="مثال: مقرئ القراءات العشر ومدرس الحديث"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-2.5 px-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                اسم الحلقة المقترحة (اختياري)
              </label>
              <input
                name="halaqahName"
                type="text"
                placeholder="مثال: حلقة الفرقان والهدى"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 py-2.5 px-3 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                نبذة تعريفية مختصرة للطلاب (اختياري)
              </label>
              <textarea
                name="bio"
                rows={2}
                placeholder="اكتب نبذة عن مسيرتك ومنهجك في مرافقة الطلاب ومتابعتهم..."
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 p-2.5 bg-slate-50/70 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 ${
            role === "student"
              ? "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20"
              : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>
            {role === "student" ? "إنشاء الحساب والبدء" : "إرسال طلب الانضمام كشيخ"}
          </span>
        </button>
      </form>

      {/* Login Redirection */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        لديك حساب بالفعل؟{" "}
        <Link
          href="/login"
          className={`font-bold hover:underline ${
            role === "student" ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
