# 🍱 Spendly — Monorepo Hostel & PG Expense Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

**Spendly** is a production-ready, full-stack monorepo web and mobile-first platform engineered specifically for hostel residents, PG occupants, and mess managers. It simplifies daily tiffin meal logging, personal categorized spending, cash/UPI payment verifications, and monthly financial balance settlements into an elegant, glassmorphic single-page application.

---

## 💡 What Problem Spendly Solves

Hostel and PG mess tracking is traditionally managed via manual registers or chaotic chat groups. This leads to:
1. **Untracked Meal Charges**: Confusion over whether a student had a full meal, half meal, or skipped lunch/dinner.
2. **Delayed Payment Settlements**: Lack of verifiable payment proof (UPI screenshots or cash receipts).
3. **Disputed Monthly Calculations**: Errors when calculating mess bills and shared hostel expenditures at month-end.
4. **Lack of Immutable Records**: Historical disputes when mess rates change mid-month.

Spendly solves these problems by providing real-time daily meal tracking, custom expense logging, instant balance settlement upon admin verification, price-versioning rules, and immutable month locking.

---

## ✨ Features Overview

- 🍱 **One-Click Tiffin Tracking**: Log daily lunch and dinner meals (`HALF`, `FULL`, `SKIP`) with automated cost computation based on workspace meal pricing rules.
- 📆 **Missing Entry Alerts & Calendar**: Visual monthly calendar identifying unfilled days so residents never miss logging a meal.
- 💸 **Categorized Personal Expenses**: Record daily personal expenditures (Food, Tea, Snacks, Grocery, Laundry, Travel, Medical, Shopping, Other).
- 💳 **Payment Logs & Screenshot Upload**: Submit cash or UPI payment entries with screenshot proof uploaded securely to Supabase Storage.
- 🛡️ **Role-Based Access Control**: Granular permissions across `STUDENT`, `ADMIN`, and `SUPER_ADMIN` roles.
- 🔒 **Month Locking & Price Versioning**: Admins lock finalized months to freeze snapshots. Meal pricing updates apply dynamically without altering locked past records.
- 📊 **Monthly Reports & Analytics**: Interactive spending charts powered by `Chart.js`, expense breakdowns, and CSV export capabilities.
- ⚡ **Real-Time Financial Settlement**: Approved payment receipts immediately adjust user balances and generate monthly snapshots.

---

## 👤 User & Admin Workflows

```
  +-------------------------------------------------------------------------+
  |                             USER WORKFLOW                               |
  +-------------------------------------------------------------------------+
  | 1. Register / Login -> 2. Select Workspace -> 3. Log Meals & Expenses   |
  | 4. Upload UPI Screenshot -> 5. View Real-Time Balance & Monthly Reports  |
  +-------------------------------------------------------------------------+

  +-------------------------------------------------------------------------+
  |                            ADMIN WORKFLOW                               |
  +-------------------------------------------------------------------------+
  | 1. Monitor Member Balances -> 2. Verify/Reject Pending UPI Payments     |
  | 3. Set Half & Full Meal Prices -> 4. Lock Closed Months for Snapshots   |
  +-------------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, TypeScript | Responsive Single Page Application with Lumina glassmorphism design |
| **Styling** | Tailwind CSS 3.4, Lucide Icons, Framer Motion | Dynamic theme styling and micro-animations |
| **State Management**| Zustand | Persistent authentication and client application state |
| **Charts & Reports** | Chart.js, React-ChartJS-2 | Interactive spending distribution and monthly trend visualizer |
| **Backend** | Node.js, Express.js, TypeScript | Modular RESTful API server with custom middleware |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM | Relational schema with index optimizations and type-safe query generation |
| **Auth & Storage** | Supabase Auth, Supabase Storage | JWT Bearer authentication and private `payment-proofs` image storage |
| **Shared Layer** | npm Workspaces | Shared Zod schemas, TypeScript interfaces, and validation contracts |

---

## 📐 Architecture Overview

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

## 📁 Project Structure

```
spendly/
├── client/                  # Frontend React SPA (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/      # AppShell, Sidebar, Headers, Modals
│   │   ├── lib/             # API Fetch Client & Date Utils
│   │   ├── modules/         # Landing, Auth, Dashboard, Tiffin, Expenses, Payments, History, Reports, Admin, Profile
│   │   └── store/           # Zustand Auth Store
│   └── package.json
├── server/                  # Backend Express REST API
│   ├── prisma/              # Prisma Schema (`schema.prisma`)
│   ├── src/
│   │   ├── lib/             # Supabase Admin Client
│   │   ├── routes/          # API Route Handler (`api.routes.ts`)
│   │   ├── seed.ts          # Super Admin & Workspace Seeder
│   │   └── index.ts         # Express Entry Point
│   └── package.json
├── shared/                  # Monorepo Shared Package
│   └── src/
│       └── index.ts         # Shared Enums, Schemas, & Types
├── docs/                    # Project Documentation
│   ├── PRD.md               # Product Requirements Document
│   ├── TRD.md               # Technical Requirements Document
│   ├── DATABASE.md          # Relational Schema & Storage Spec
│   ├── SECURITY.md          # Security Architecture & Hardening
│   ├── SETUP.md             # Local Developer Setup Guide
│   ├── DEPLOYMENT.md        # Production Deployment Specs
│   ├── STITCH_DESIGN_SPEC.md# Master UI Design System & Specification
│   └── supabase_migration.sql # Production Supabase Migration SQL
├── MEMORY.md                # Technical Memory for AI Coding Agents
├── .env.example             # Template for Environment Variables
├── .gitignore               # Production Version Control Ignores
└── package.json             # Root Monorepo Configuration
```

---

## 🔐 Authentication & Authorization Architecture

- **Supabase Auth Integration**: Registration creates an auth user in Supabase Auth as well as a corresponding database row in the `User` table linked to the `SPENDLY_HOSTEL` workspace.
- **JWT Bearer Token Flow**: The client stores the JWT in `localStorage` (`spendly_auth_token`) and includes it in the `Authorization: Bearer <token>` header for all API requests.
- **Role Control**:
  - `requireAuth`: Middleware verifying valid Supabase JWTs.
  - `requireAdmin`: Middleware verifying the requesting user holds `ADMIN` or `SUPER_ADMIN` privileges in the `User` database record.

---

## 🗄️ Database Architecture

The relational schema is configured in PostgreSQL and accessed via Prisma and the Supabase Admin SDK:
- **`Workspace`**: Workspace entity storing code `SPENDLY_HOSTEL`.
- **`User`**: User record mapped to Supabase `auth.users.id`.
- **`WorkspaceMember`**: Junction table mapping users to workspaces with specified roles.
- **`MealPrice`**: Tracks half and full meal rates per workspace (`halfPrice`, `fullPrice`).
- **`Meal`**: Daily lunch & dinner records with date constraint `UNIQUE(workspaceId, userId, date)`.
- **`ExpenseCategory`**: Pre-seeded expense categories (`Food`, `Tea`, `Snacks`, `Grocery`, `Laundry`, `Travel`, `Medical`, `Shopping`, `Other`).
- **`Expense`**: Logged personal expenditures.
- **`Payment`**: Payment submissions (`CASH`, `UPI`) with verification status (`PENDING`, `APPROVED`, `REJECTED`).
- **`MonthlySnapshot`**: Aggregated end-of-month balances per user/month (`isLocked`, `status`).
- **`AuditLog`**: System and administrative audit trail.

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Public | Register new user account |
| **Auth** | `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| **User** | `/api/user/profile` | `GET`, `PATCH` | Student+ | View and update profile information |
| **Dashboard** | `/api/dashboard/summary` | `GET` | Student+ | Get real-time balance & monthly metrics |
| **Meals** | `/api/meals/today` | `GET` | Student+ | Fetch today's meal selection |
| **Meals** | `/api/meals` | `POST` | Student+ | Record lunch/dinner options |
| **Meals** | `/api/meals/month` | `GET` | Student+ | Get monthly meal records |
| **Expenses** | `/api/expenses` | `GET`, `POST` | Student+ | Fetch & create personal expenses |
| **Payments** | `/api/payments` | `GET`, `POST` | Student+ | Submit cash/UPI payment entries |
| **Payments** | `/api/payments/upload-proof` | `POST` | Student+ | Upload payment proof screenshot |
| **Admin** | `/api/admin/members` | `GET` | Admin+ | Fetch workspace members & balances |
| **Admin** | `/api/admin/payments/:id/status` | `PATCH` | Admin+ | Approve or reject pending payments |
| **Admin** | `/api/admin/prices` | `GET`, `POST` | Admin+ | Read and update meal prices |
| **Admin** | `/api/admin/month-lock` | `POST` | Admin+ | Lock/unlock monthly snapshot |
| **Reports** | `/api/reports/monthly` | `GET` | Student+ | Generate monthly report & category breakdown |

---

## ☁️ Storage & Payment Proof Architecture

1. **Upload Handler**: `multer` intercepts incoming `multipart/form-data` requests in-memory up to 5MB, strictly validating `PNG`, `JPEG`, and `WEBP` MIME types.
2. **Supabase Bucket**: Uploads buffer directly to the private `payment-proofs` Supabase bucket under `${userId}/${timestamp}_filename`.
3. **Signed Access URLs**: Client requests private signed URLs via `GET /api/payments/:id/proof-url`, providing temporary, secure 1-hour access for admins to inspect proof screenshots.

---

## 🔑 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
DATABASE_URL=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres
ADMIN_EMAIL=admin@spendly.io
ADMIN_PASSWORD=your_secure_admin_password
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## ⚡ Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/spendly.git
cd spendly
npm install
```

### 2. Configure Environment Files
Copy `.env.example` to `server/.env` and `client/.env`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Database Migration & Seed
```bash
# Generate Prisma client
npm run prisma:generate

# Build shared package
npm run build --workspace=shared

# Start full-stack development server
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🚀 Production Build & Deployment

### Monorepo Build Command
```bash
npm run build
```
Executes compilation across `shared`, `server`, and `client`.

### Supported Deployment Targets
- **Frontend SPA**: Vercel or Netlify (Deploy `client/dist`).
- **Backend Node API**: Render, Railway, or DigitalOcean App Platform (Execute `npm run start --workspace=server`).
- **Database & Storage**: Supabase Cloud PostgreSQL & Supabase Storage.

---

## 🛡️ Security Highlights

- **Server-Side Isolation**: Supabase Service-Role keys remain isolated on the Express server.
- **Signed Storage URLs**: Private payment screenshots are never exposed via public URLs.
- **Strict Validation**: All incoming API payloads are parsed and sanitized via Zod schemas.
- **CORS Protection**: Restricted origin configuration preventing unauthorized cross-domain requests.

---

## 🎯 Current Status & Roadmap

- **Current Status**: Production Ready & Fully Operational.
- **Planned Enhancements**:
  - [ ] Multi-workspace creation UI for multiple PGs/hostels
  - [ ] Push notifications for monthly pending dues
  - [ ] Direct UPI QR code generation inside payment portal
  - [ ] Automated PDF statement downloading

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
