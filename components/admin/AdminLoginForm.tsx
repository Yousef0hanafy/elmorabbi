"use client";

import { useSearchParams } from "next/navigation";
import { adminLoginAction } from "@/lib/actions/admin-actions";
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d1715] px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg shadow-emerald-700/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            بوابة الإدارة المركزية
          </h1>
          <p className="text-xs text-slate-400 font-quran mt-1">
            دخول محمي لمشرفي منصة المربي لإدارة النظام وقواعد البيانات
          </p>
        </div>

        {error === "invalid_credentials" && (
          <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-3.5 mb-6 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>بيانات الدخول غير صحيحة. يرجى التحقق والمحاولة مجدداً.</span>
          </div>
        )}

        {/* Form */}
        <form action={adminLoginAction} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              البريد الإلكتروني للإدارة
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="admin@example.com"
                className="w-full text-xs rounded-xl border border-slate-700 p-3 bg-slate-800/80 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:bg-slate-800 transition-all font-mono"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full text-xs rounded-xl border border-slate-700 p-3 bg-slate-800/80 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:bg-slate-800 transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>دخول لوحة التحكم</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
          >
            <span>العودة للمنصة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
