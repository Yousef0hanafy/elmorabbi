import type { MetadataRoute } from "next";

// Installable web app (PWA) metadata
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة المربي",
    short_name: "المربي",
    description: "متابعة الصلوات والأذكار وورد القرآن بإشراف الشيخ المربي",
    // Opening the installed app sends signed-in users straight to their dashboard
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#f8faf9",
    theme_color: "#064e3b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
