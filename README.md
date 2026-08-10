# 🍱 Spendly — Hostel & PG Expense Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

**Spendly** is a production-ready, full-stack monorepo web application engineered specifically for hostel residents, PG occupants, and mess managers. It simplifies daily tiffin meal logging, personal categorized spending, cash/UPI payment verifications, and monthly financial balance settlements into an elegant, glassmorphic single-page application.

---

## 🌐 Live Production Application

- **Production App**: [https://spendly-client-phi.vercel.app](https://spendly-client-phi.vercel.app)
- **Production API**: [https://spendly-api-n0jr.onrender.com](https://spendly-api-n0jr.onrender.com)
- **API Health Check**: [https://spendly-api-n0jr.onrender.com/health](https://spendly-api-n0jr.onrender.com/health)
- **GitHub Repository**: [https://github.com/tahirtai/spendly](https://github.com/tahirtai/spendly)

---

## 💡 What Problem Spendly Solves

Hostel and PG mess tracking is traditionally managed via manual paper registers or chaotic chat groups. This leads to:
1. **Untracked Meal Charges**: Confusion over whether a student had a full meal, half meal, or skipped lunch/dinner.
2. **Delayed Payment Settlements**: Lack of verifiable payment proof (UPI screenshots or cash receipts).
3. **Disputed Monthly Calculations**: Errors when calculating mess bills and shared hostel expenditures at month-end.
4. **Lack of Immutable Records**: Historical disputes when mess rates change mid-month.

Spendly solves these problems by providing real-time daily meal tracking, custom expense logging, instant balance settlement upon admin verification, price-versioning rules, and immutable month locking.

---

## ✨ Features Overview

### Currently Implemented
- 🍱 **One-Click Tiffin Tracking**: Log daily lunch and dinner meals (`HALF`, `FULL`, `SKIP`) with automated cost computation based on workspace meal pricing rules.
- 📆 **Missing Entry Alerts & Calendar**: Visual monthly calendar identifying unfilled days so residents never miss logging a meal.
- 💸 **Categorized Personal Expenses**: Record daily personal expenditures across 9 pre-seeded categories (Food, Tea, Snacks, Grocery, Laundry, Travel, Medical, Shopping, Other).
- 💳 **Payment Logs & Screenshot Upload**: Submit cash or UPI payment entries with screenshot proof uploaded securely to private Supabase Storage (`payment-proofs`).
- 🛡️ **Role-Based Access Control**: Granular permissions across `STUDENT`, `ADMIN`, and `SUPER_ADMIN` roles.
- 🔒 **Month Locking & Price Versioning**: Admins lock finalized months to freeze snapshots. Meal pricing updates apply dynamically without altering locked past records.
- 📊 **Monthly Reports & Analytics**: Interactive spending charts powered by `Chart.js`, expense category breakdowns, and CSV export capabilities.
- ⚡ **Real-Time Financial Settlement**: Approved payment receipts immediately adjust user balances and generate monthly snapshots.

### Future / Planned Enhancements
- 📱 Native Mobile App (Capacitor / React Native wrapper)
- 🔔 Push & Email Notifications for pending dues
- 🖼️ Direct QR Code Generation in payment submission dialog
- 📑 PDF Monthly Statement download

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
| **Frontend** | React 18, Vite 5, TypeScript | Responsive Single Page Application with Lumina glassmorphism design hosted on Vercel |
| **Styling** | Tailwind CSS 3.4, Lucide Icons, Framer Motion | Dynamic theme styling and micro-animations |
| **State Management**| Zustand | Persistent authentication and client application state |
| **Charts & Reports** | Chart.js, React-ChartJS-2 | Interactive spending distribution and monthly trend visualizer |
| **Backend** | Node.js 20, Express.js, TypeScript | Modular RESTful API server hosted on Render |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM | Relational schema hosted on Supabase Cloud |
| **Auth & Storage** | Supabase Auth, Supabase Storage | JWT Bearer authentication and private `payment-proofs` image storage |
| **Shared Layer** | npm Workspaces | Shared Zod schemas, TypeScript interfaces, and validation contracts |

---

## 📐 Monorepo Architecture

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
│   └── STITCH_DESIGN_SPEC.md# Master UI Design System & Specification
├── MEMORY.md                # Technical Memory for AI Coding Agents
├── .node-version            # Node version pin (20.20.0)
├── .gitignore               # Production Version Control Ignores
└── package.json             # Root Monorepo Configuration
```

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `/health` | `GET` | Public | Unauthenticated health check endpoint |
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

## 🔐 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres
ADMIN_EMAIL=admin@spendly.io
ADMIN_PASSWORD=your_admin_password
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## ⚡ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/tahirtai/spendly.git
cd spendly
npm ci
```

### 2. Configure Environment Files
Create `server/.env` and `client/.env` using your Supabase credentials:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Generate Prisma Client & Build Shared Package
```bash
npm run prisma:generate
npm run build --workspace=shared
```

### 4. Start Development Servers
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🚀 Production Build

```bash
npm run build
```
Compiles `spendly-shared`, `spendly-server`, and `spendly-client` in dependency sequence.

---

## 🛡️ Security Highlights

- **Server-Side Key Isolation**: Supabase Service Role key is strictly isolated on the Express server.
- **Signed Storage URLs**: Private payment screenshot URLs expire after 1 hour.
- **Zod Input Parsing**: Incoming API payloads are validated against shared Zod schemas.
- **CORS Protection**: Restricted origin header matching production client URL.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
