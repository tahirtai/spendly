# Spendly AI Memory

## Project Identity
- **Name**: Spendly
- **Type**: Monorepo Web & Mobile SaaS Platform for Hostel & PG Expense Management
- **Current Status**: Fully functional, production-ready full-stack application.
- **Monorepo Structure**: `shared`, `server`, `client`.

---

## Current Production Status
- **Status**: Live in Production.
- **Frontend Host**: Vercel
- **Backend Host**: Render
- **Database & Storage**: Supabase Cloud

---

## Production URLs
- **Frontend App**: `https://spendly-client-phi.vercel.app`
- **Backend API**: `https://spendly-api-n0jr.onrender.com`
- **Health Check**: `https://spendly-api-n0jr.onrender.com/health`
- **GitHub Repository**: `https://github.com/tahirtai/spendly`

---

## Repository
- **Repo URL**: `https://github.com/tahirtai/spendly`
- **Primary Branch**: `main`

---

## Architecture

```
+-------------------------------------------------------------------+
|                        SPENDLY MONOREPO                           |
+-------------------------------------------------------------------+
                                  |
    +-----------------------------+-----------------------------+
    |                             |                             |
    v                             v                             v
+-------+                     +-------+                     +-------+
|shared |                     |server |                     |client |
+-------+                     +-------+                     +-------+
 Shared Types                  Express API                   React Vite SPA
 Zod Validation Schemas        Prisma ORM & Supabase Admin   Tailwind UI & Glassmorphism
 API DTO Contracts             Multer Memory Storage         Zustand Auth Store
```

---

## Monorepo Structure
- **Root (`package.json`)**: npm workspaces layout (`shared`, `server`, `client`), Node version pin (`.node-version` containing `20.20.0`).
- **`shared/`**: Common schemas (`zod`), TypeScript interfaces, and shared utility definitions (`spendly-shared`).
- **`server/`**: Express API server with Prisma ORM and Supabase Admin client (`spendly-server`).
- **`client/`**: React 18 SPA built with Vite and Tailwind CSS (`spendly-client`).

---

## Frontend
- **Framework**: React 18 (TypeScript) with Vite 5
- **Routing**: `react-router-dom` (v6) wrapped in `<AppShell>`
- **State Management**: `zustand` (`useAuthStore.ts` with `localStorage` persistence)
- **Styling**: Tailwind CSS 3.4, Lucide React icons, Framer Motion animations
- **Visual Analytics**: `Chart.js` & `react-chartjs-2` for monthly spending distribution and daily trend visualizer
- **Hosting**: Vercel SPA deployment pointing to `client/` root, `dist` output

---

## Backend
- **Runtime**: Node.js 20 LTS (`v20.20.0`) with Express.js (TypeScript compiled via `tsc` or executed with `tsx watch`)
- **Host Binding**: Host `0.0.0.0`, Port `process.env.PORT` (local fallback `5000`)
- **API Router**: Centralized router at `/api` (`server/src/routes/api.routes.ts`)
- **File Uploads**: `multer` in-memory buffer handling (5MB max limit, PNG/JPEG/WEBP validation)
- **Hosting**: Render Web Service (`spendly-api`)

---

## Shared Package
- **Package**: `spendly-shared` (`file:../shared`)
- **Exports**: Zod schemas (`RegisterSchema`, `LoginSchema`, `RecordMealSchema`, `CreateExpenseSchema`, `SubmitPaymentSchema`, `UpdateMealPricesSchema`, `MonthLockSchema`, etc.) and TypeScript interfaces (`UserProfile`, `MealRecord`, `ExpenseRecord`, `PaymentRecord`, `MonthlySnapshotRecord`, `DashboardSummary`, `MonthlyReport`).

---

## Database
- **Engine**: PostgreSQL 15+ hosted on Supabase Cloud
- **ORM**: Prisma ORM (`@prisma/client` ^5.14.0)
- **Schema Location**: `server/prisma/schema.prisma`

---

## Supabase
- **Auth**: Managed via Supabase Auth (`supabase.auth.signInWithPassword` & `supabaseAdmin.auth.admin.createUser`)
- **Storage**: Private bucket `payment-proofs` storing uploaded UPI payment screenshots
- **Signed URLs**: Temporary signed URLs generated via `supabaseAdmin.storage.from('payment-proofs').createSignedUrl(filepath, 3600)`

---

## Authentication
- **User Registration**: `POST /api/auth/register` creates Supabase Auth user and mirrors to PostgreSQL `User` table.
- **User Login**: `POST /api/auth/login` verifies credentials via Supabase Auth and returns a JWT bearer token.
- **Token Handling**: Client stores JWT in `localStorage` (`spendly_auth_token`) and sends header `Authorization: Bearer <token>`.
- **Middleware**: `requireAuth` validates JWT via `supabase.auth.getUser(token)`. `requireAdmin` checks `Role` in `User` table (`ADMIN` or `SUPER_ADMIN`).

---

## Storage
- Private Supabase Storage bucket `payment-proofs`.
- Image buffers uploaded via `POST /api/payments/upload-proof`.
- Signed 1-hour URLs fetched via `GET /api/payments/:id/proof-url`.

---

## API Routes

| Category | Method | Path | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` | No | Public | Returns `{ status: 'ok', service: 'Spendly API' }` |
| **Auth** | `POST` | `/api/auth/register` | No | Public | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | No | Public | Authenticate user & return JWT token |
| **User** | `GET` | `/api/user/profile` | Yes | Student+ | View profile information |
| **User** | `PATCH` | `/api/user/profile` | Yes | Student+ | Update name, phone, avatar |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Yes | Student+ | Get real-time balance & metrics |
| **Meals** | `GET` | `/api/meals/today` | Yes | Student+ | Fetch today's meal selection |
| **Meals** | `POST` | `/api/meals` | Yes | Student+ | Record lunch and dinner options |
| **Meals** | `GET` | `/api/meals/month` | Yes | Student+ | Fetch monthly meal records |
| **Expenses** | `GET` | `/api/expenses` | Yes | Student+ | Fetch personal expenses |
| **Expenses** | `POST` | `/api/expenses` | Yes | Student+ | Create personal expense |
| **Expenses** | `PUT` | `/api/expenses/:id` | Yes | Student+ | Update personal expense |
| **Expenses** | `DELETE` | `/api/expenses/:id` | Yes | Student+ | Delete personal expense |
| **Payments** | `GET` | `/api/payments` | Yes | Student+ | Fetch payment history |
| **Payments** | `POST` | `/api/payments` | Yes | Student+ | Submit cash/UPI payment |
| **Payments** | `POST` | `/api/payments/upload-proof` | Yes | Student+ | Upload payment screenshot |
| **Payments** | `GET` | `/api/payments/:id/proof-url` | Yes | Student+ | Get signed screenshot URL |
| **Admin** | `GET` | `/api/admin/members` | Yes | Admin+ | Fetch workspace members & balances |
| **Admin** | `PATCH` | `/api/admin/members/:id/role` | Yes | SuperAdmin | Change member role |
| **Admin** | `DELETE` | `/api/admin/members/:id` | Yes | Admin+ | Delete workspace member |
| **Admin** | `PATCH` | `/api/admin/payments/:id/status` | Yes | Admin+ | Approve or reject payment |
| **Admin** | `GET` | `/api/admin/prices` | Yes | Admin+ | Fetch meal prices |
| **Admin** | `POST` | `/api/admin/prices` | Yes | Admin+ | Update meal prices |
| **Admin** | `POST` | `/api/admin/month-lock` | Yes | Admin+ | Lock/unlock monthly snapshot |
| **Reports** | `GET` | `/api/reports/monthly` | Yes | Student+ | Generate monthly report & CSV data |

---

## User Roles and Permissions
- `STUDENT`: Record meals, log personal expenses, submit payments, view personal reports, edit profile.
- `ADMIN`: All `STUDENT` permissions + view member balances, verify/reject payments, update meal prices, lock/unlock month snapshots.
- `SUPER_ADMIN`: All `ADMIN` permissions + assign member roles (`STUDENT`, `ADMIN`, `SUPER_ADMIN`).

---

## Data Models
- **`Workspace`**: Code `SPENDLY_HOSTEL`.
- **`User`**: Mapped to Supabase `auth.users.id`.
- **`WorkspaceMember`**: Maps user to workspace with role.
- **`MealPrice`**: Workspace meal rates (`halfPrice`, `fullPrice`).
- **`Meal`**: Daily lunch/dinner entries (`HALF`, `FULL`, `SKIP`).
- **`ExpenseCategory`**: Pre-seeded categories (`Food`, `Tea`, `Snacks`, `Grocery`, `Laundry`, `Travel`, `Medical`, `Shopping`, `Other`).
- **`Expense`**: Personal spending entry.
- **`Payment`**: Payment record (`CASH`, `UPI`) with status (`PENDING`, `APPROVED`, `REJECTED`).
- **`MonthlySnapshot`**: Monthly user ledger snapshot (`mealTotal`, `expenseTotal`, `paymentTotal`, `balanceDue`, `status`, `isLocked`).

---

## Environment Variables

### Server (`server/.env`)
- `PORT`: API server port (`5000`)
- `NODE_ENV`: Runtime environment (`development` / `production`)
- `CLIENT_URL`: Allowed CORS origin (`https://spendly-client-phi.vercel.app`)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role secret key
- `DATABASE_URL`: PostgreSQL database connection string
- `ADMIN_EMAIL`: Initial admin email for seeding
- `ADMIN_PASSWORD`: Initial admin password for seeding

### Client (`client/.env`)
- `VITE_API_URL`: Backend API base URL (`https://spendly-api-n0jr.onrender.com`)

---

## Local Development
```bash
# Clean install
npm ci

# Generate Prisma client & build shared workspace
npm run prisma:generate
npm run build --workspace=shared

# Start development servers
npm run dev
```

---

## Production Deployment

### Frontend (Vercel)
- Root directory: `client`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Production URL: `https://spendly-client-phi.vercel.app`

### Backend (Render)
- Service: `spendly-api` (Web Service)
- Node version: `20.20.0`
- Build command: `npm ci && npm run build --workspace=shared && npm run build --workspace=server`
- Start command: `npm run start --workspace=server`
- Host: `0.0.0.0`
- Production URL: `https://spendly-api-n0jr.onrender.com`

---

## Build Commands
- `npm run build`: Monorepo build (compiles `shared`, `server`, and `client`).
- `npm run build --workspace=shared`: Builds shared package.
- `npm run build --workspace=server`: Compiles Express backend to `server/dist`.
- `npm run build --workspace=client`: Builds Vite frontend to `client/dist`.

---

## Current Deployment Topology
```
GitHub (main)
 ├── Vercel (client SPA -> https://spendly-client-phi.vercel.app)
 └── Render (server API -> https://spendly-api-n0jr.onrender.com)
      └── Supabase Cloud (PostgreSQL + Auth + Storage)
```

---

## Important Security Rules
1. **Service Role Key Isolation**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code or Vercel environment.
2. **Secret Protection**: Never commit `.env` files or hardcode credentials.
3. **Signed URLs**: Always generate temporary 1-hour signed URLs for private payment proof screenshots.
4. **CORS Restrictions**: Always enforce explicit origin validation matching production `CLIENT_URL`.

---

## Important Business Rules
1. **Immutable Snapshots**: Locked months must not allow meal/expense modifications.
2. **Price Versioning**: Changing meal prices must only affect future un-locked meals; past locked snapshots must remain unchanged.
3. **Instant Settlement**: Approving a payment entry updates user balance immediately.

---

## Known Constraints
- **Render Free Tier Spin-Down**: The free Web Service on Render spins down after 15 minutes of inactivity. Initial request after inactivity may take 30-50 seconds. This is hosting provider behavior, not an application bug.

---

## Documentation Rules
- Always update documentation after architectural or deployment changes.
- Always use real production URLs (`spendly-client-phi.vercel.app`, `spendly-api-n0jr.onrender.com`).
- Never invent placeholder domains (`spendly.app`).

---

## AI Coding Rules
1. Read `MEMORY.md` before making modifications.
2. Source code (`*.ts`, `*.tsx`, `schema.prisma`) is authoritative over old documentation.
3. Never make database schema changes without explicit user approval.
4. Never modify production authentication casually.
5. Never expose secrets.
6. Never modify API contracts without checking frontend consumer components.
7. Never remove existing functionality during UI work.
8. Never run destructive Prisma or database commands (`prisma db push`, `migrate reset`).
9. Verify builds with `npm run build` after changes.
10. Keep changes minimal and targeted.

---

## Do-Not-Break Rules
- DO NOT break mobile UI navigation in `AppShell.tsx`.
- DO NOT break auth persistence in `useAuthStore.ts`.
- DO NOT change backend port / host binding logic in `server/src/index.ts`.
- DO NOT modify Zod validation contracts in `shared/src/index.ts` without updating client/server invocation sites.

---

## Current Known Technical Debt
- Minor CodeRabbit type warnings on implicit type coercions in non-critical components.
- Single workspace model (`SPENDLY_HOSTEL`) pre-seeded; multi-workspace switching UI not yet exposed.

---

## Future Work
- Multi-workspace UI switcher
- Push & Email Notifications
- Direct UPI QR Code Generator
- PDF Monthly Statement Exporter
