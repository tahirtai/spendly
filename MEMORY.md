# Spendly AI Memory

## Project Identity
- **Name**: Spendly
- **Type**: Monorepo Web & Mobile SaaS Platform for Hostel & PG Expense Management
- **Current Status**: Fully functional, production-ready full-stack application.
- **Monorepo Structure**: `shared`, `server`, `client`.

---

## Golden Rule
> [!CAUTION]
> **NEVER BREAK EXISTING WORKING FUNCTIONALITY.**
> Always inspect the actual source code (`client/src`, `server/src`, `shared/src`) before making modifications.
> Do NOT rewrite working features, alter database schemas, break API contracts, or change authentication/storage workflows unless explicitly requested.

---

## Current Architecture

### 1. Frontend (`client/`)
- **Framework**: React 18 (TypeScript) with Vite 5
- **Routing**: `react-router-dom` (v6) with single-page app layout wrapped in `<AppShell>`
- **State Management**: `zustand` (`useAuthStore.ts` with `localStorage` persistence)
- **UI & Styling**: Tailwind CSS 3.4, Lucide React icons, Framer Motion animations
- **Charts & Reports**: `Chart.js` & `react-chartjs-2` for monthly spending visual analytics
- **Mobile UI**: Mobile-first glassmorphic UI, top header (`SpendlyLogo`), bottom navigation bar (`AppShell`), and responsive desktop container

### 2. Backend (`server/`)
- **Runtime**: Node.js with Express.js (TypeScript compiled via `tsc` or executed with `tsx watch`)
- **API Architecture**: Centralized REST router at `/api` (`server/src/routes/api.routes.ts`)
- **File Uploads**: `multer` in-memory storage (5MB max limit, PNG/JPEG/WEBP validation)
- **Authentication Middleware**: `requireAuth` validates Supabase JWT bearer tokens via `supabase.auth.getUser(token)`
- **Authorization Middleware**: `requireAdmin` checks role in DB `User` table for `ADMIN` or `SUPER_ADMIN`

### 3. Shared Layer (`shared/`)
- **Package**: `spendly-shared` (local monorepo package)
- **Exports**: Zod schemas (`RegisterSchema`, `LoginSchema`, `RecordMealSchema`, `CreateExpenseSchema`, `SubmitPaymentSchema`, `UpdateMealPricesSchema`, `MonthLockSchema`, etc.) and TypeScript interfaces (`UserProfile`, `MealRecord`, `ExpenseRecord`, `PaymentRecord`, `MonthlySnapshotRecord`, `DashboardSummary`, `MonthlyReport`).

### 4. Database (`server/prisma/schema.prisma` & `docs/supabase_migration.sql`)
- **Engine**: PostgreSQL 15+ hosted on Supabase
- **ORM / Query Engine**: Prisma ORM (`@prisma/client`) & Supabase JS Admin client (`supabaseAdmin`)
- **Tables**:
  - `Workspace`: Hostel/PG workspace instance (`SPENDLY_HOSTEL`)
  - `User`: Mirrors Supabase Auth users (ID stored as string UUID)
  - `WorkspaceMember`: Maps users to workspaces with roles
  - `MealPrice`: Workspace meal pricing rules (`halfPrice`, `fullPrice`)
  - `Meal`: Daily lunch/dinner logs per user per date
  - `ExpenseCategory`: Pre-seeded expense categories
  - `Expense`: Categorized daily spending logs
  - `Payment`: Cash/UPI payment submissions with status (`PENDING`, `APPROVED`, `REJECTED`)
  - `MonthlySnapshot`: Immutable monthly financial snapshots per user/month
  - `AuditLog`: Log of administrative actions
- **Enums**: `Role` (`STUDENT`, `ADMIN`, `SUPER_ADMIN`), `MealOption` (`HALF`, `FULL`, `SKIP`), `PaymentType` (`CASH`, `UPI`), `PaymentStatus` (`PENDING`, `APPROVED`, `REJECTED`), `MonthStatus` (`OPEN`, `CLOSED`, `PAID`, `PENDING`).

### 5. Supabase Integration
- **Auth**: Email/Password authentication managed by Supabase Auth (`supabase.auth.signInWithPassword` and `supabaseAdmin.auth.admin.createUser`)
- **Storage Bucket**: `payment-proofs` (private bucket storing uploaded UPI payment screenshots)
- **Signed URLs**: Generated dynamically via `supabaseAdmin.storage.from('payment-proofs').createSignedUrl(filepath, 3600)`

---

## Roles and Permissions

| Role | Permissions |
| :--- | :--- |
| `STUDENT` | Log daily meals, log personal expenses, submit payments, view personal history & reports, update profile |
| `ADMIN` | All `STUDENT` permissions + view all member balances, approve/reject pending payments, update meal prices, lock/unlock month snapshots, delete members |
| `SUPER_ADMIN` | All `ADMIN` permissions + change member roles (`STUDENT` <-> `ADMIN` <-> `SUPER_ADMIN`) |

---

## API Architecture Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **User & Workspace**: `GET /api/workspaces/mine`, `GET /api/user/profile`, `PATCH /api/user/profile`
- **Dashboard**: `GET /api/dashboard/summary`
- **Meals**: `GET /api/meals/today`, `POST /api/meals`, `GET /api/meals/month`, `GET /api/meals/missing`
- **Expenses**: `GET /api/expenses`, `POST /api/expenses`, `PUT /api/expenses/:id`, `DELETE /api/expenses/:id`, `GET /api/expense-categories`
- **Payments**: `GET /api/payments`, `POST /api/payments`, `DELETE /api/payments/:id`, `POST /api/payments/upload-proof`, `GET /api/payments/:id/proof-url`
- **Admin**: `GET /api/admin/members`, `PATCH /api/admin/members/:id/role`, `DELETE /api/admin/members/:id`, `GET /api/admin/pending-payments`, `GET /api/admin/payment-history`, `PATCH /api/admin/payments/:id/status`, `GET /api/admin/prices`, `POST /api/admin/prices`, `POST /api/admin/month-lock`
- **Reports & History**: `GET /api/reports/monthly`, `GET /api/history`, `GET /api/history/snapshot-details`

---

## Key UI Components & Navigation

- `LandingView.tsx`: Public marketing landing page with glassmorphism UI, stats, features, and CTA
- `LoginView.tsx` / `RegisterView.tsx`: Auth pages with interactive switch card (`auth-switch.tsx`)
- `AppShell.tsx`: Mobile app frame, top header (`SpendlyLogo`), user avatar menu, navigation bar
- `DashboardView.tsx`: Overview of total balance, meal counts, daily expenses, quick meal logging, missing entry banner
- `TiffinView.tsx`: Daily lunch/dinner selector, meal price indicator, monthly calendar visualization with missing days detection
- `ExpensesView.tsx`: Categorized spending logger, expense filter, list, and edit/delete modal
- `PaymentsView.tsx`: Payment history list, cash/UPI submission modal with screenshot upload
- `HistoryView.tsx`: Monthly snapshot list, locked month status badges, balance breakdown modal
- `ReportsView.tsx`: Visual analytics with Chart.js pie/bar charts, expense category breakdown, export buttons
- `AdminView.tsx`: Admin tabs for Member Balances, Payment Verifications, Meal Pricing rules, and Month Locking
- `ProfileView.tsx`: User profile management (Name, Phone, Avatar URL, Role badge, Workspace details)

---

## Important Files (DO NOT MODIFY WITHOUT CARE)

- `shared/src/index.ts`: Shared Zod schemas & TypeScript types
- `server/src/routes/api.routes.ts`: Main Express API router
- `server/prisma/schema.prisma`: Database schema definition
- `client/src/lib/api.ts`: Centralized HTTP fetch wrapper (`apiFetch`, `api.get`, `api.post`)
- `client/src/store/useAuthStore.ts`: Authentication state store
- `client/src/components/AppShell.tsx`: Main application layout wrapper
- `docs/supabase_migration.sql`: Database initialization script

---

## Environment Variables Summary

### Server (`server/.env`)
- `PORT`: API server port (default `5000`)
- `NODE_ENV`: Runtime environment (`development` / `production`)
- `CLIENT_URL`: Allowed CORS origin (`http://localhost:5173`)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role secret key
- `DATABASE_URL`: PostgreSQL database connection string
- `ADMIN_EMAIL`: Initial admin email for seeding
- `ADMIN_PASSWORD`: Initial admin password for seeding

### Client (`client/.env`)
- `VITE_API_URL`: Backend API base URL (`http://localhost:5000`)

---

## AI Coding Rules for Spendly

1. **Inspect before editing**: Always read the existing file content before modifying it.
2. **Never assume old docs are correct**: Source code (`*.ts`, `*.tsx`) is the single source of truth.
3. **Never expose secrets**: Use environment placeholders in documentation (`YOUR_SUPABASE_URL`, etc.). Never commit `.env` files.
4. **Preserve database schemas**: Do not alter Prisma schemas or SQL tables unless explicitly requested.
5. **Preserve API contracts**: Keep request body shapes and response schemas consistent across `shared`, `server`, and `client`.
6. **Preserve authentication & authorization**: Maintain Supabase JWT bearer token verification and role checks (`requireAuth`, `requireAdmin`).
7. **Preserve mobile UI & Lumina glassmorphism**: Keep existing component hierarchy and styling conventions.
8. **Verify build after changes**: Run `npm run build` at root to verify TypeScript compilation across all 3 workspaces.
9. **Prefer minimal targeted changes**: Avoid refactoring working code or re-implementing existing utilities.
