import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/shared/Header";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Users,
  Compass,
  ArrowLeft,
  Sparkles,
  Flame,
  HeartHandshake,
  Clock,
} from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{ source?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSession();
  const primary = !session
    ? { href: "/register", label: "ابدأ رحلتك الآن" }
    : session.role === "sheikh"
    ? { href: "/sheikh", label: "متابعة طلاب حلقتي" }
    : session.role === "admin"
    ? { href: "/admin", label: "لوحة الإدارة" }
    : { href: "/student", label: "تابع وردك اليوم" };

  // The installed app opens at /?source=pwa: members skip the landing page
  if (session && (await searchParams).source === "pwa") {
    redirect(primary.href);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9]">
      <Header />

      {/* Hero Section - 100% Student Centric */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white pt-16 pb-28 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Brand Logo Emblem */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-white/95 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20 ring-4 ring-emerald-500/20 overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.jpg"
                alt="شعار منصة المربي"
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-[20px]"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-200 mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>منصة بناء العادات الإيمانية ومرافقة المربين</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
            استقم على طاعة ربك <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 font-quran">
              بإشراف شيخك ومربيك
            </span>
          </h1>

          <p className="text-emerald-100/90 text-base sm:text-lg max-w-2xl mx-auto font-quran leading-relaxed mb-10">
            «أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ». تابع صلواتك في أوقاتها، وأذكار الصباح والمساء، وورد القرآن، وتلقَّ التوجيه الأخوي المباشر من شيخك ليُعينك على الثبات.
          </p>

          {/* Primary actions adapt to the visitor: continue for members, sign up for guests */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={primary.href}
              className="w-full sm:w-auto min-h-12 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{primary.label}</span>
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>

            {!session && (
              <Link
                href="/login"
                className="w-full sm:w-auto min-h-12 px-6 py-4 rounded-2xl bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-100 font-semibold text-sm border border-emerald-500/30 shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4 text-amber-300" aria-hidden="true" />
                <span>لديّ حساب بالفعل</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Floating Student Experience Mockup */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-emerald-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-1.5 inline-block">
                نموذج من ورد اليوم
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                متابعة يومية سهلة لا تستغرق دقيقة
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>سلسلة الاستقامة: 14 يوماً متتالياً</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-1">
              <span className="text-xs text-slate-500">صلاة الفجر</span>
              <span className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> في جماعة
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-1">
              <span className="text-xs text-slate-500">ورد القرآن</span>
              <span className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-emerald-600" /> 4 صفحات
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-1">
              <span className="text-xs text-slate-500">أذكار الصباح</span>
              <span className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> تم الإنجاز
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1">
              <span className="text-xs text-slate-500">توجيه الشيخ</span>
              <span className="text-sm font-bold text-amber-900 flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-amber-600" /> ثناء وتشجيع
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            ركائز تبني استقامتك يومياً
          </h2>
          <p className="text-slate-600 text-sm font-quran leading-relaxed">
            صممت المنصة لتعينك على الثبات دون تعقيد أو تشتيت، مع الحفاظ على روح الإخلاص
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">الصلوات الخمس في أوقاتها</h3>
            <p className="text-sm text-slate-600 font-quran leading-relaxed">
              تسجيل سهل بضغطة واحدة لأداء الفريضة في جماعة المسجد أو في وقتها، مع متابعة الفجر كمعيار أساسي لصلاح اليوم.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">القرآن وحصن المسلم</h3>
            <p className="text-sm text-slate-600 font-quran leading-relaxed">
              تثبيت ورد التلاوة اليومي بعدد الصفحات مع عداد ذكي، وحماية نفسك بأذكار الصباح والمساء يومياً.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">مرافقة الشيخ والمربي</h3>
            <p className="text-sm text-slate-600 font-quran leading-relaxed">
              لست وحدك في رحلتك؛ يتابع شيخك تقدمك، ويشد على يدك إذا ثابرت، وينبهك برفق إذا غفلت أو قصرت.
            </p>
          </div>
        </div>
      </section>

      {/* How it works for student */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
              خطوات بسيطة
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              كيف تبدأ مع المربي؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-1">سجل حسابك</h4>
              <p className="text-xs text-slate-500 font-quran">
                أنشئ حسابك في ثوانٍ وابدأ فوراً في تسجيل وردك اليومي.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-1">اختر شيخك المربي</h4>
              <p className="text-xs text-slate-500 font-quran">
                تصفح قائمة المشايخ المعتمدين وانضم لحلقة الشيخ الذي تفضله.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-1">استقم وتلقَّ التوجيه</h4>
              <p className="text-xs text-slate-500 font-quran">
                حافظ على استمرار سلسلتك اليومية واستقبل نصائح وتشجيع شيخك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discreet Sheikh & Educator Invitation Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 my-16">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-8 sm:p-10 text-white border border-emerald-800/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              <Users className="w-3.5 h-3.5" />
              <span>لأصحاب الفضيلة والمربين</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              هل أنت شيخ أو معلم قرآن؟
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 font-quran max-w-md leading-relaxed">
              تتيح لك منصة المربي مرافقة طلابك ومتابعة صلواتهم وأورادهم القرآنية وتقديم النصح والتوجيه بضغطة زر.
            </p>
          </div>

          <Link
            href="/sheikh"
            className="shrink-0 px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm border border-emerald-600/50 shadow-md transition-all flex items-center gap-2"
          >
            <span>بوابة دخول المشايخ</span>
            <ArrowLeft className="w-4 h-4 text-amber-300" />
          </Link>
        </div>
      </section>

      {/* Clean Footer (No Admin Links) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-400/40 p-0.5 bg-white shadow-xs">
              <Image
                src="/logo.jpg"
                alt="شعار منصة المربي"
                width={28}
                height={28}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <span className="font-bold text-slate-700">منصة المربي © {new Date().getFullYear()}</span>
          </div>
          <span className="font-quran text-slate-500">«وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ»</span>
          <div className="flex items-center gap-4">
            <Link href="/student" className="hover:text-emerald-700 transition-colors">بوابة الطالب</Link>
            <Link href="/sheikh" className="hover:text-amber-700 transition-colors">بوابة المربين</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
