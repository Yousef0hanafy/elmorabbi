import { requireRole } from "@/lib/auth";

// Runs before the loading boundary streams, so unauthenticated visitors get a real
// HTTP redirect. Each page still calls requireRole() itself (layouts are not
// re-run on every client navigation).
export default async function SheikhLayout({ children }: { children: React.ReactNode }) {
  await requireRole("sheikh");
  return children;
}
