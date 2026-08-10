# 🛠️ Spendly — Technical Requirements Document (TRD)

**Version:** 1.0 (Final Production Audit)  
**Target Architecture:** TypeScript Monorepo (`shared`, `server`, `client`)  
**Status:** Production-Ready & Verified  

---

## 1. System Architecture Overview

Spendly is architected as a clean, decoupled TypeScript monorepo using standard npm workspaces:

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
 Shared Schemas                Express API                   React 18 SPA
 Zod Models                    Prisma & Supabase Admin       Vite 5 Bundler
 TypeScript Interfaces         Multer Upload Pipeline        Tailwind CSS & Glassmorphism
```

- **`shared`**: Defines common Zod schemas and TypeScript interfaces used by both client and server.
- **`server`**: Node.js Express server handling API requests, file uploads, JWT validation, and database operations.
- **`client`**: React single page application with client-side routing, state management, and mobile-first glassmorphism design.

---

## 2. Technology Stack Specifications

### Frontend (`client/`)
- **Framework**: React 18.3.1 with Vite 5.4
- **Language**: TypeScript 5.4
- **Routing**: `react-router-dom` v6.23
- **State Management**: `zustand` v4.5 with `localStorage` persistence
- **Styling**: Tailwind CSS v3.4, PostCSS, Autoprefixer, Lucide React icons
- **Animations**: `framer-motion` v11.2
- **Data Visualization**: `chart.js` v4.4 & `react-chartjs-2` v5.2

### Backend (`server/`)
- **Runtime**: Node.js v20+ with Express v4.19
- **Execution & Watch**: `tsx` v4.23 for dev server; `tsc` compiler for production
- **Validation**: Zod schema validation middleware (`validate()`)
- **Database Access**: Prisma ORM (`@prisma/client` v5.14) & `@supabase/supabase-js` v2.43
- **File Uploads**: `multer` v2.2 (in-memory buffer handling)
- **Security**: CORS origin restrictions, `x-powered-by` header disabled

### Shared Layer (`shared/`)
- **Validation Library**: `zod` v3.23
- **Types**: Contract interfaces for User, Meal, Expense, Payment, Snapshot, and Report objects.

---

## 3. Database & Schema Specifications

The PostgreSQL database is hosted on Supabase and accessed through Prisma ORM and the Supabase Admin JS SDK.

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
  id            String    @id @default(uuid())
  workspaceId   String
  halfPrice     Float
  fullPrice     Float
  effectiveFrom DateTime  @default(now())
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
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
  id        String  @id @default(uuid())
  name      String  @unique
  isDefault Boolean @default(true)
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
  id           String      @id @default(uuid())
  workspaceId  String
  userId       String
  month        String // Format: YYYY-MM
  mealTotal    Float
  expenseTotal Float
  paymentTotal Float
  balanceDue   Float
  status       MonthStatus @default(OPEN)
  isLocked     Boolean     @default(false)
  createdAt    DateTime    @default(now())
  workspace    Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

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

## 4. API Endpoint Contracts

All API endpoints are defined in `server/src/routes/api.routes.ts`:

### Auth Routes
- `POST /api/auth/register`
  - Body: `RegisterInput` (`fullName`, `email`, `password`, `phone?`)
  - Response: `{ success: true, message: string }`
- `POST /api/auth/login`
  - Body: `LoginInput` (`email`, `password`)
  - Response: `{ user: UserProfile, token: string }`

### User & Workspace Routes
- `GET /api/workspaces/mine` (Auth required) -> Returns user workspace object
- `GET /api/user/profile` (Auth required) -> Returns user profile
- `PATCH /api/user/profile` (Auth required) -> Updates user profile (`fullName?`, `phone?`, `avatarUrl?`)

### Dashboard & Analytics Routes
- `GET /api/dashboard/summary` (Auth required) -> Returns `DashboardSummary` metrics
- `GET /api/reports/monthly` (Auth required, optional `?month=YYYY-MM`) -> Returns `MonthlyReport`

### Meal (Tiffin) Routes
- `GET /api/meals/today` (Auth required) -> Returns today's meal record
- `POST /api/meals` (Auth required) -> Records meal selection (`date`, `lunch`, `dinner`)
- `GET /api/meals/month` (Auth required, optional `?month=YYYY-MM`) -> Returns monthly meal list
- `GET /api/meals/missing` (Auth required, optional `?month=YYYY-MM`) -> Returns list of unrecorded dates

### Expense Routes
- `GET /api/expenses` (Auth required, optional `?month=YYYY-MM`) -> List user's expenses
- `POST /api/expenses` (Auth required) -> Create expense (`category`, `amount`, `date`, `note?`)
- `PUT /api/expenses/:id` (Auth required) -> Update existing expense
- `DELETE /api/expenses/:id` (Auth required) -> Delete expense
- `GET /api/expense-categories` -> Returns default pre-seeded categories

### Payment Routes
- `GET /api/payments` (Auth required, optional `?month=YYYY-MM`) -> List user's payments
- `POST /api/payments` (Auth required) -> Submit payment record (`type`, `amount`, `date`, `note?`, `screenshotPath?`)
- `DELETE /api/payments/:id` (Auth required) -> Delete pending payment record
- `POST /api/payments/upload-proof` (Auth required) -> Multipart file upload for payment screenshot
- `GET /api/payments/:id/proof-url` (Auth required) -> Generates temporary signed URL for screenshot viewing

### Admin Management Routes
- `GET /api/admin/members` (Admin required) -> List workspace members and current balance breakdown
- `PATCH /api/admin/members/:id/role` (Super Admin required) -> Update member role (`STUDENT`, `ADMIN`, `SUPER_ADMIN`)
- `DELETE /api/admin/members/:id` (Admin required) -> Remove member from workspace
- `GET /api/admin/pending-payments` (Admin required) -> List payments awaiting approval
- `GET /api/admin/payment-history` (Admin required) -> List verified and rejected payment history
- `PATCH /api/admin/payments/:id/status` (Admin required) -> Approve (`APPROVED`) or reject (`REJECTED`) payment
- `GET /api/admin/prices` -> Fetch workspace meal prices (`halfPrice`, `fullPrice`)
- `POST /api/admin/prices` (Admin required) -> Update workspace meal pricing rules
- `POST /api/admin/month-lock` (Admin required) -> Lock (`isLocked: true`) or unlock a target month snapshot

### Snapshot & History Routes
- `GET /api/history` (Auth required) -> List user's monthly snapshot history
- `GET /api/history/snapshot-details` (Auth required, `?month=YYYY-MM`) -> Detailed historical breakdown for month

---

## 5. Security & Authentication Middleware

### JWT Token Verification (`requireAuth`)
Extracts `Authorization: Bearer <token>` header and verifies session with `supabase.auth.getUser(token)`. Attaches authenticated user object to `req.authUser`.

### Admin Authorization (`requireAdmin`)
Checks database `User` table for `req.authUser.id` to verify that the user role is `ADMIN` or `SUPER_ADMIN`. Rejects unauthorized calls with HTTP `403 Forbidden`.

### File Upload Pipeline & Validation
- Storage Engine: `multer.memoryStorage()`
- File Size Limit: 5 MB (`5 * 1024 * 1024` bytes)
- MIME Type Whitelist: `image/png`, `image/jpeg`, `image/webp`
- Supabase Bucket: `payment-proofs` (Private storage bucket)
- Signed URLs: Created with 3600-second (1 hour) expiration limit

---

## 6. Build & Compilation Specifications

```bash
# Build TypeScript Shared Library
npm run build --workspace=shared

# Build Express Server
npm run build --workspace=server

# Build Vite Frontend Client
npm run build --workspace=client
```

All 3 workspace packages compile without error into their respective `dist/` build directories.
