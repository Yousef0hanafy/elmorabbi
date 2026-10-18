import confetti from "canvas-confetti";

const BRAND_COLORS = ["#059669", "#10b981", "#d97706", "#fbbf24"];

// Short confetti burst for completed actions. Skipped for users who prefer reduced motion,
// and never allowed to break the calling handler.
export function celebrate(size: "small" | "large" = "small"): void {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    confetti({
      particleCount: size === "large" ? 80 : 40,
      spread: size === "large" ? 70 : 50,
      origin: { y: 0.6 },
      colors: BRAND_COLORS,
    });
  } catch {
    // Decorative only
  }
}
