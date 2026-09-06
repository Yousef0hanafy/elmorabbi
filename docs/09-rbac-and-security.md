# RBAC & Security

## Role-Based Access Control (RBAC)

1. **Student**
   - Read/Write access ONLY to their own `daily_logs` and `messages`.
   - Read access to their own `student_tasks`.
   - Cannot view other students' data.

2. **Sheikh**
   - Read access to `users`, `student_tasks`, and `daily_logs` WHERE `users.sheikh_id == auth.uid()`.
   - Write access to `messages` sent to their students.
   - Write access to modify `student_tasks` for their assigned students.
   - Cannot view students assigned to other Sheikhs.

3. **Admin**
   - Global Read/Write access.

## Security Implementation
- **Row Level Security (RLS):** Implemented directly at the PostgreSQL level (via Supabase). This ensures that even if an API route is compromised, the database will reject unauthorized queries.
- **Data Privacy:** Personal reflections or private messages must be strictly isolated.
