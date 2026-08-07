# 🛡️ Spendly — Security & Compliance Guidelines

Security is a primary design goal for **Spendly**. This document covers environment variable hygiene, authentication security, role authorization, and production server hardening.

---

## 🔒 1. Secret Hygiene & Git Best Practices

- **Never Commit Credentials**: Real API keys, passwords, database passwords, or JWT secrets must never be committed to Git.
- **Environment Isolation**: Always separate development credentials from production credentials.
- **`.gitignore` Enforcements**: `.env`, `.env.local`, and all `.env.*` files are strictly listed in `.gitignore`.
- **Rotatable Keys**: Use Supabase Dashboard to rotate service role keys if leakage is ever suspected.

---

## 🔑 2. Authentication & Authorization Controls

- **Supabase Auth Integration**: User identity is verified using standard JWT bearer tokens issued by Supabase Auth.
- **Role Hierarchy**:
  - `STUDENT`: Access restricted strictly to own workspace and own records.
  - `ADMIN`: Workspace-wide administrative access for verifying payments and locking months.
  - `SUPER_ADMIN`: System-wide access.
- **No Self-Promotion**: Public registration (`/auth/register`) strictly assigns the `STUDENT` role by default. Admin roles cannot be acquired via client requests.

---

## 🌐 3. Server Security & Hardening

- **Security Headers (`Helmet`)**: Express server utilizes `helmet` middleware to set HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).
- **Strict CORS**: Cross-Origin Resource Sharing (CORS) is configured using the `CLIENT_URL` environment variable to block unauthorized origins in production.
- **Input Validation**: All incoming API requests undergo validation with TypeScript interfaces and Prisma parameterization to prevent SQL injection.
- **Error Shielding**: Database tracebacks and sensitive internal stack traces are suppressed in production mode to prevent information disclosure.
