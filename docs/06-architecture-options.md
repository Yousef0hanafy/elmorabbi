# Architecture Options

## 1. The Database & Backend
- **Option A: Firebase (NoSQL)** - Fast to build, good realtime. *Cons:* Relational queries (Sheikh -> Students -> Tasks) become complex and hard to scale.
- **Option B: Supabase (PostgreSQL)** - Excellent relational data modeling, built-in Auth, Row Level Security (RLS), and Realtime. *Cons:* Steeper learning curve for complex RLS.
- **Option C: Custom Node.js/Express + Prisma + Postgres** - Maximum control. *Cons:* Slower time to market, requires managing auth and infra manually.

## 2. The Frontend Framework
- **Option A: React (Vite) SPA** - Simple, decoupled. *Cons:* SEO is poor, initial load can be slow.
- **Option B: Next.js (App Router)** - Full-stack capabilities, server-side rendering, excellent developer experience, easy API routes. *Cons:* Can be overkill for simple apps.

## 3. Styling
- **Tailwind CSS:** Industry standard, excellent RTL support via plugins or native `dir="rtl"`.
