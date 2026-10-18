# Recommended Architecture

> **ملحوظة (الحالة الفعلية):** المشروع اتنفّذ بـ **Neon Postgres + Drizzle ORM** بدل Supabase، والصلاحيات متطبقة في طبقة التطبيق (`requireRole` + فحص الملكية في الـ Server Actions) بدل RLS، والمهام ثابتة كأعمدة في `daily_logs` بدل `task_templates`. الوثيقة دي هي التوصية الأصلية وقت الاكتشاف. الوضع الحالي موجود في `README.md` و`docs/discovery/`.

Based on the requirements for relational data (Sheikhs/Students), role-based access, and a fast, responsive mobile web experience, I recommend the following stack:

## The Stack (T3-esque / Supabase)
1. **Framework:** Next.js (App Router) with TypeScript. Provides a robust full-stack environment.
2. **Database & Auth:** Supabase (PostgreSQL). 
   - *Why?* Relational data is crucial here. Supabase provides out-of-the-box Auth and Row Level Security (RLS) which solves our complex Role-Based Access Control requirements instantly.
3. **Styling:** Tailwind CSS + Shadcn UI (accessible, customizable components).
4. **State Management:** React Query (for client-side fetching/caching) + Server Actions (Next.js).
5. **Hosting:** Vercel.

## Core Principles
- **Mobile-First:** Design every component for mobile screens first, then scale up for the Sheikh's desktop dashboard.
- **Arabic-First:** Implement `dir="rtl"` at the root layout and ensure all UI components respect logical CSS properties (e.g., `ms-4` instead of `ml-4`).
