# 🛠️ Spendly — Technical Requirements Document (TRD)

**Version:** 1.0 (MVP)  
**Target Environment:** Monorepo (Production-Ready SaaS)  

---

## 1. Technology Stack

### Frontend
- **Framework**: React 18+ with Vite & TypeScript
- **Styling**: Tailwind CSS, shadcn/ui component library, CSS variables
- **Animations**: Framer Motion
- **State & Data Fetching**: Zustand (global/local state), TanStack Query (v5)
- **Forms & Validation**: React Hook Form + Zod schema validation

### Backend & API
- **Runtime**: Node.js with Express & TypeScript
- **Validation**: Zod schema validation middleware for all API requests
- **ORM**: Prisma ORM with automated migrations

### Database & Cloud Services
- **Database**: Supabase PostgreSQL (Postgres 17)
- **Authentication**: Supabase Auth (JWT tokens, password hashing, OAuth)
- **File Storage**: Supabase Storage (Private bucket `payment-proofs` with signed URLs)

---

## 2. Monorepo Directory Architecture

```text
Spendly/
├── client/                      # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/ui/       # shadcn/ui reusable UI components
│   │   ├── modules/             # Feature-based modular structure
│   │   │   ├── auth/            # Authentication views & state
│   │   │   ├── dashboard/       # Dashboard widgets & layout
│   │   │   ├── tiffin/          # Meal tracking components & hook
│   │   │   ├── expenses/        # Daily expense logging
│   │   │   ├── payments/        # Cash/UPI payment forms & proof upload
│   │   │   ├── history/         # Monthly history & snapshot view
│   │   │   ├── reports/         # Report generation & PDF/CSV export
│   │   │   ├── admin/           # Admin management panel & lock controls
│   │   │   └── coming-soon/     # Placeholders for future modules
│   │   ├── store/               # Zustand state stores
│   │   └── lib/                 # Utility functions & API clients
│   ├── index.html
│   └── vite.config.ts
├── server/                      # Node.js + Express API Backend
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── routes/              # Express REST routes
│   │   ├── middlewares/         # Auth, error handling, Zod validation
│   │   ├── services/            # Core business logic
│   │   └── utils/               # Supabase client & storage utilities
│   ├── prisma/
│   │   ├── schema.prisma        # Database model definitions
│   │   └── migrations/          # SQL migration files
│   └── package.json
├── shared/                      # Shared Types & Zod Schemas
│   ├── src/
│   │   ├── types/               # TypeScript interface exports
│   │   └── schemas/             # Shared Zod validation schemas
├── stitch_designs/              # Exact HTML UI templates from Stitch
├── PRD.md                       # Product Requirements Document
├── TRD.md                       # Technical Requirements Document
├── STITCH_DESIGN_SPEC.md        # Design Tokens & UI Specs
└── mcp.json                     # Environment MCP configuration
```

---

## 3. Database Architecture & Schema (Prisma)

Every business entity is strictly scoped to `workspace_id`.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  ADMIN
  SUPER_ADMIN
}

enum MealOption {
  HALF
  FULL
  SKIP
}

enum PaymentType {
  CASH
  UPI
}

enum PaymentStatus {
  PENDING
  APPROVED
  REJECTED
}

enum MonthStatus {
  OPEN
  CLOSED
  PAID
  PENDING
}

model Workspace {
  id               String            @id @default(uuid())
  name             String
  code             String            @unique
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  members          WorkspaceMember[]
  mealPrices       MealPrice[]
  meals            Meal[]
  expenses         Expense[]
  payments         Payment[]
  monthlySnapshots MonthlySnapshot[]
  auditLogs        AuditLog[]
}

model User {
  id               String            @id
  email            String            @unique
  fullName         String
  phone            String?
  avatarUrl        String?
  role             Role              @default(STUDENT)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  workspaceMembers WorkspaceMember[]
  meals            Meal[]
  expenses         Expense[]
  payments         Payment[]
  auditLogs        AuditLog[]
}

model WorkspaceMember {
  id          String    @id @default(uuid())
  workspaceId String
  userId      String
  role        Role      @default(STUDENT)
  joinedAt    DateTime  @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
}

model MealPrice {
  id          String    @id @default(uuid())
  workspaceId String
  halfPrice   Float
  fullPrice   Float
  effectiveFrom DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

model Meal {
  id          String     @id @default(uuid())
  workspaceId String
  userId      String
  date        DateTime   @db.Date
  lunch       MealOption @default(SKIP)
  dinner      MealOption @default(SKIP)
  lunchCost   Float      @default(0)
  dinnerCost  Float      @default(0)
  totalCost   Float      @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId, date])
}

model ExpenseCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  isDefault   Boolean  @default(true)
}

model Expense {
  id          String    @id @default(uuid())
  workspaceId String
  userId      String
  category    String
  amount      Float
  note        String?
  date        DateTime  @db.Date
  createdAt   DateTime  @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Payment {
  id             String        @id @default(uuid())
  workspaceId    String
  userId         String
  type           PaymentType
  amount         Float
  screenshotPath String?
  note           String?
  date           DateTime      @db.Date
  status         PaymentStatus @default(PENDING)
  verifiedBy     String?
  createdAt      DateTime      @default(now())
  workspace      Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model MonthlySnapshot {
  id            String      @id @default(uuid())
  workspaceId   String
  userId        String
  month         String      // Format: YYYY-MM
  mealTotal     Float
  expenseTotal  Float
  paymentTotal  Float
  balanceDue    Float
  status        MonthStatus @default(OPEN)
  isLocked      Boolean     @default(false)
  createdAt     DateTime    @default(now())
  workspace     Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId, month])
}

model AuditLog {
  id          String    @id @default(uuid())
  workspaceId String
  actorId     String
  action      String
  resource    String
  oldValue    Json?
  newValue    Json?
  createdAt   DateTime  @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  actor       User      @relation(fields: [actorId], references: [id], onDelete: Cascade)
}
```

---

## 4. Security & Row Level Security (RLS) Policies

1. **Authentication**: Managed via Supabase Auth. Passwords are never stored in plain text. JWT bearer tokens accompany all API calls.
2. **RLS Rules**:
   - **Students**: Read/Write access strictly restricted to `auth.uid() == user_id`.
   - **Admins**: Read/Write access scoped to records matching their `workspace_id`.
   - **Super Admin**: Bypasses workspace isolation for cross-workspace management.
3. **File Upload Security**:
   - Bucket: `payment-proofs` (Private).
   - Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`.
   - Max file size: **5MB**.
   - Access: Generates short-lived signed URLs for Admin verification.

---

## 5. API Endpoints Contract

### Auth & Workspace
- `POST /api/auth/register` — Student registration (Defaults to STUDENT role)
- `POST /api/auth/login` — Authenticate user and return JWT session
- `GET /api/workspaces/mine` — Get current user's workspace info

### Meals (Tiffin)
- `GET /api/meals/today` — Retrieve today's meal selection
- `POST /api/meals` — Record/update daily meal (Half/Full/Skip)
- `GET /api/meals/missing` — List unrecorded dates for current month

### Daily Expenses
- `GET /api/expenses` — List expenses for selected month
- `POST /api/expenses` — Create a new expense entry
- `DELETE /api/expenses/:id` — Delete an expense (If month unlocked)

### Payments
- `GET /api/payments` — Fetch user's payment records
- `POST /api/payments` — Submit Cash or UPI payment proof
- `PATCH /api/payments/:id/verify` — Admin endpoint to approve/reject payment

### Reports & History
- `GET /api/reports/monthly` — Fetch monthly summary breakdown
- `GET /api/reports/export/pdf` — Download PDF report
- `GET /api/reports/export/csv` — Download CSV report
- `GET /api/history` — List past monthly snapshots

### Admin Panel
- `GET /api/admin/students` — List workspace members
- `POST /api/admin/prices` — Update workspace meal prices
- `POST /api/admin/month-lock` — Lock or unlock a monthly cycle

---

## 6. Development Workflow & Next Steps

1. **Prisma & Database Setup**: Run `npx prisma db push` to synchronize tables with Supabase PostgreSQL (`db.bixrljfqzvwtxqkyrpoo.supabase.co`).
2. **Storage Bucket**: Create the private `payment-proofs` bucket in Supabase Storage.
3. **Frontend Assembly**: Build the application modules using the exact UI templates in `stitch_designs/`.
