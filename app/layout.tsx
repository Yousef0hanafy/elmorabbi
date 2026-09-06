import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة المربي | متابعة العبادات وتزكية النفس",
  description: "منصة إسلامية تربوية متكاملة تجمع الطالب بالشيخ والمعلم لمتابعة الصلوات، الأذكار، ورد القرآن، وبناء العادات الصالحة والتزكية المستمرة.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body className="min-h-screen bg-[#f8faf9] text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
