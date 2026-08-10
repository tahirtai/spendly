# 🛡️ Spendly — Security & Threat Model Architecture

This document details the security posture, authentication framework, authorization enforcement, storage access controls, environment credential protection, and known technical debt for **Spendly**.

---

## 🔒 1. Credential Management & Environment Isolation

### Principles
- **No Hardcoded Secrets**: Raw API keys, JWT secrets, database connection passwords, or service-role keys must NEVER be committed to version control.
- **Environment Placeholders**: Documentation and setup guides use standardized placeholder strings.
- **Strict `.gitignore` Enforcement**: Monorepo root `.gitignore` enforces exclusion of `.env`, `.env.local`, `.env.*`, and temporary log files.

### Key Separation Architecture
- **Client Workspace (`client/.env`)**:
  - `VITE_API_URL`: Backend API endpoint string (`https://spendly-api-n0jr.onrender.com` in production or `http://localhost:5000` in dev).
  - *No Supabase Service-Role key is EVER placed in client-side code.*
- **Server Workspace (`server/.env`)**:
  - `SUPABASE_SERVICE_ROLE_KEY`: Privileged key allowing backend administrative database and auth management. Isolated strictly on the Node.js server.
  - `DATABASE_URL`: Direct PostgreSQL connection string.

---

## 🔑 2. Authentication & Authorization Framework

### Authentication Flow
1. **Registration**: `POST /api/auth/register` creates an authenticated user in Supabase Auth (`supabaseAdmin.auth.admin.createUser`) and inserts a corresponding record in the PostgreSQL `User` table with default role `STUDENT`.
2. **Login**: `POST /api/auth/login` authenticates user credentials via `supabase.auth.signInWithPassword` and returns a Supabase JWT Bearer token along with user profile metadata.
3. **Session Persistence**: The frontend SPA persists the JWT token in browser `localStorage` (`spendly_auth_token`) and automatically attaches `Authorization: Bearer <token>` to all HTTP requests via `apiFetch()`.

### Authorization Middleware
- **JWT Verification (`requireAuth`)**: Server middleware extracts the bearer token and validates session validity via `supabase.auth.getUser(token)`. Requests missing valid tokens receive `401 Unauthorized`.
- **Role Control (`requireAdmin`)**: Admin endpoints query the database `User` table for `req.authUser.id` and verify role equality to `ADMIN` or `SUPER_ADMIN`. Non-admin requests receive `403 Forbidden`.
- **Role Escalation Protection**: Public registration endpoints strictly hardcode role assignment to `STUDENT`. Member role modifications can only be triggered via `PATCH /api/admin/members/:id/role` by authenticated `SUPER_ADMIN` accounts.

---

## 🛡️ 3. Database Security & Row Level Security (RLS)

While the Express server operates using the Supabase Service-Role key to execute queries on behalf of authenticated users, PostgreSQL Row Level Security (RLS) is enabled on all tables as defense-in-depth against direct client-side SDK queries:

```sql
-- RLS Policy Examples (docs/supabase_migration.sql)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON "User" FOR SELECT USING (auth.uid()::text = id);

ALTER TABLE "Meal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own meals" ON "Meal" FOR SELECT USING (auth.uid()::text = "userId");

ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own expenses" ON "Expense" FOR SELECT USING (auth.uid()::text = "userId");

ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own payments" ON "Payment" FOR SELECT USING (auth.uid()::text = "userId");
```

---

## 📁 4. Storage Security & File Upload Hardening

UPI payment screenshot uploads undergo multi-layered validation:

1. **In-Memory Buffer**: Files are parsed in-memory using `multer.memoryStorage()`, preventing unvalidated files from hitting local disk.
2. **File Size Limit**: Upload size is capped at 5 MB (`5 * 1024 * 1024` bytes). Oversized files return HTTP `413 File Size Exceeds Limit`.
3. **MIME Type Whitelist**: Strict checking restricts uploads to `image/png`, `image/jpeg`, and `image/webp`. Invalid MIME types return HTTP `400 Bad Request`.
4. **Private Storage Bucket**: Uploaded screenshots are stored in the private `payment-proofs` Supabase bucket under `${userId}/${timestamp}_filename`. Direct public access is disabled.
5. **Short-Lived Signed Access URLs**: Admins inspect screenshot proofs via signed URLs (`createSignedUrl`) generated on demand with a 3600-second (1 hour) expiration limit.

---

## 🌐 5. Network Hardening & Server Protections

- **Disabled `x-powered-by` Header**: Prevents technology disclosure (`app.disable('x-powered-by')`).
- **CORS Configuration**: Restricts origin requests to production client domain (`https://spendly-client-phi.vercel.app`) or localhost during development.
- **Input Sanitization & Type Safety**: API request bodies are parsed using Zod schemas (`safeParse`), rejecting malformed payloads before hitting controllers.
- **Global Error Handling**: Express error handler suppresses database tracebacks in production, returning sanitized JSON error messages.

---

## ⚠️ 6. Known Security Technical Debt

1. **Client Token Storage**: Authentication JWT tokens are currently stored in `localStorage` (`spendly_auth_token`) for SPA session persistence. Storing tokens in HTTP-only, SameSite cookies is a recommended future hardening measure against potential XSS vectors.
2. **Single Workspace Pre-Seeding**: Currently, workspace resolution defaults to pre-seeded `SPENDLY_HOSTEL`. Strict multi-tenant isolation header enforcement will be required when multi-workspace UI is enabled.
3. **CORS Development Fallback**: Permissive fallback exists in non-production development mode to facilitate local developer testing.

---

## 📋 7. Production Security Checklist

- [x] Verify `SUPABASE_SERVICE_ROLE_KEY` is set ONLY in server environment variables.
- [x] Confirm `NODE_ENV=production` is active on deployment server.
- [x] Ensure `CLIENT_URL` is set to `https://spendly-client-phi.vercel.app`.
- [x] Verify database connection strings use SSL flags (`?sslmode=require`).
- [ ] Change initial seed admin password immediately after first login in production.
