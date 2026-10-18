# Data Model (Core Entities)

> **ملحوظة:** ده نموذج البيانات المقترح في البداية. النموذج المنفّذ فعلاً موجود في `db/schema.ts`.

*Assuming PostgreSQL via Supabase*

**1. `users`**
- `id` (UUID, PK)
- `email` (String)
- `full_name` (String)
- `role` (Enum: 'admin', 'sheikh', 'student')
- `sheikh_id` (UUID, FK -> users.id, nullable)
- `created_at` (Timestamp)

**2. `task_templates`**
- `id` (UUID, PK)
- `title` (String)
- `description` (Text)
- `category` (Enum: 'prayer', 'quran', 'adhkar', 'custom')
- `frequency` (Enum: 'daily', 'weekly')

**3. `student_tasks` (The Learning Plan)**
- `id` (UUID, PK)
- `student_id` (UUID, FK -> users.id)
- `task_template_id` (UUID, FK -> task_templates.id)
- `is_active` (Boolean)

**4. `daily_logs` (The actual tracking)**
- `id` (UUID, PK)
- `student_task_id` (UUID, FK -> student_tasks.id)
- `date` (Date)
- `status` (Enum: 'completed', 'missed', 'excused')
- `notes` (Text)

**5. `messages`**
- `id` (UUID, PK)
- `sender_id` (UUID, FK)
- `receiver_id` (UUID, FK)
- `content` (Text)
- `created_at` (Timestamp)
