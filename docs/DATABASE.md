# 🗄️ Spendly — Database & Supabase Architecture Guide

This document describes the PostgreSQL relational schema, Prisma configuration, Row-Level Security (RLS) policies, and Supabase Storage bucket specifications for **Spendly**.

---

## 🏗️ Relational Data Model Architecture

Spendly uses **PostgreSQL 15+** hosted on **Supabase**, managed via **Prisma ORM** (`server/prisma/schema.prisma`) and the **Supabase Admin SDK** (`supabaseAdmin`).

```
+-------------------------------------------------------------------------+
|                                Workspace                                |
|             id (UUID), name (text), code (text, UNIQUE)                 |
+-------------------------------------------------------------------------+
       |                  |                    |                  |
       |                  |                    |                  |
       v                  v                    v                  v
+--------------+  +---------------+  +------------------+  +--------------+
|     User     |  | WorkspaceMem  |  |    MealPrice     |  | ExpenseCateg |
|  id (text)   |  | workspaceId   |  |  halfPrice (flt) |  |  name (text) |
| email (text) |  | userId (text) |  |  fullPrice (flt) |  | isDefault(b) |
| role (Role)  |  | role (Role)   |  | effectiveFrom(ts)|  +--------------+
+--------------+  +---------------+  +------------------+
       |                                       |
       +-------------------+-------------------+
                           |
       +-------------------+-------------------+-------------------+
       |                   |                   |                   |
       v                   v                   v                   v
+--------------+   +---------------+   +---------------+   +---------------+
|     Meal     |   |    Expense    |   |    Payment    |   | MonthlySnap   |
| workspaceId  |   | workspaceId   |   | workspaceId   |   | workspaceId   |
| userId       |   | userId        |   | userId        |   | userId        |
| date (date)  |   | category(txt) |   | type (Type)   |   | month(YYYY-MM)|
| lunch(Option)|   | amount (flt)  |   | amount (flt)  |   | mealTotal(flt)|
| dinner(Opt)  |   | date (date)   |   | screenshot(tx)|   | expenseTot(fl)|
| totalCost    |   +---------------+   | status(Status)|   | paymentTot(fl)|
+--------------+                       +---------------+   | balanceDue(fl)|
                                                           | isLocked(bool)|
                                                           +---------------+
```

---

## 📊 Detailed Database Tables

### 1. `Workspace`
Stores workspace information for hostels or PGs.
- `id`: `String` (UUID, Primary Key)
- `name`: `String` (Name of workspace)
- `code`: `String` (Unique workspace code, default: `SPENDLY_HOSTEL`)
- `createdAt`: `DateTime` (Timestamp)
- `updatedAt`: `DateTime` (Timestamp)

### 2. `User`
Stores user profile information synced with Supabase Auth (`auth.users`).
- `id`: `String` (Primary Key, mirrors `auth.users.id` UUID)
- `email`: `String` (Unique)
- `fullName`: `String`
- `phone`: `String?` (Optional)
- `avatarUrl`: `String?` (Optional)
- `role`: `Role` Enum (`STUDENT`, `ADMIN`, `SUPER_ADMIN`, Default: `STUDENT`)
- `createdAt`: `DateTime`
- `updatedAt`: `DateTime`

### 3. `WorkspaceMember`
Junction table linking Users to Workspaces.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `userId`: `String` (Foreign Key -> `User.id`)
- `role`: `Role` Enum (`STUDENT`, `ADMIN`, `SUPER_ADMIN`)
- `joinedAt`: `DateTime`
- **Constraint**: `UNIQUE(workspaceId, userId)`

### 4. `MealPrice`
Stores current and historical meal rates per workspace.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `halfPrice`: `Float` (Price for a half meal, e.g. 50.0)
- `fullPrice`: `Float` (Price for a full meal, e.g. 80.0)
- `effectiveFrom`: `DateTime` (Effective timestamp)

### 5. `Meal`
Daily lunch and dinner tracking per user per date.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `userId`: `String` (Foreign Key -> `User.id`)
- `date`: `DateTime` (`@db.Date`, YYYY-MM-DD)
- `lunch`: `MealOption` Enum (`HALF`, `FULL`, `SKIP`, Default: `SKIP`)
- `dinner`: `MealOption` Enum (`HALF`, `FULL`, `SKIP`, Default: `SKIP`)
- `lunchCost`: `Float` (Cost calculated at entry time)
- `dinnerCost`: `Float` (Cost calculated at entry time)
- `totalCost`: `Float` (Lunch cost + Dinner cost)
- **Constraint**: `UNIQUE(workspaceId, userId, date)`

### 6. `ExpenseCategory`
Pre-seeded system expense categories.
- `id`: `String` (UUID, Primary Key)
- `name`: `String` (Unique category name: `Food`, `Tea`, `Snacks`, `Grocery`, `Laundry`, `Travel`, `Medical`, `Shopping`, `Other`)
- `isDefault`: `Boolean` (Default: `true`)

### 7. `Expense`
Personal daily spending logs.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `userId`: `String` (Foreign Key -> `User.id`)
- `category`: `String` (Category name)
- `amount`: `Float` (Amount spent)
- `note`: `String?` (Optional note)
- `date`: `DateTime` (`@db.Date`, YYYY-MM-DD)
- `createdAt`: `DateTime`

### 8. `Payment`
Cash and UPI payment submissions.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `userId`: `String` (Foreign Key -> `User.id`)
- `type`: `PaymentType` Enum (`CASH`, `UPI`)
- `amount`: `Float` (Payment amount)
- `screenshotPath`: `String?` (Storage filepath in `payment-proofs` bucket)
- `note`: `String?` (Optional transaction reference note)
- `date`: `DateTime` (`@db.Date`, YYYY-MM-DD)
- `status`: `PaymentStatus` Enum (`PENDING`, `APPROVED`, `REJECTED`, Default: `PENDING`)
- `verifiedBy`: `String?` (User ID of verifying admin)
- `createdAt`: `DateTime`

### 9. `MonthlySnapshot`
Immutable monthly balance snapshots generated on month lock.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `userId`: `String` (Foreign Key -> `User.id`)
- `month`: `String` (Format: `YYYY-MM`)
- `mealTotal`: `Float` (Sum of meal costs for month)
- `expenseTotal`: `Float` (Sum of expenses for month)
- `paymentTotal`: `Float` (Sum of approved payments for month)
- `balanceDue`: `Float` (`mealTotal + expenseTotal - paymentTotal`)
- `status`: `MonthStatus` Enum (`OPEN`, `CLOSED`, `PAID`, `PENDING`, Default: `OPEN`)
- `isLocked`: `Boolean` (Default: `false`, set to `true` on lock)
- **Constraint**: `UNIQUE(workspaceId, userId, month)`

### 10. `AuditLog`
Administrative action audit entries.
- `id`: `String` (UUID, Primary Key)
- `workspaceId`: `String` (Foreign Key -> `Workspace.id`)
- `actorId`: `String` (Foreign Key -> `User.id`)
- `action`: `String` (Action name)
- `resource`: `String` (Target resource)
- `oldValue`: `Json?`
- `newValue`: `Json?`
- `createdAt`: `DateTime`

---

## 🔀 Database Enums

```prisma
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
```

---

## 🔒 Supabase Storage Bucket Specifications

- **Bucket Name**: `payment-proofs`
- **Visibility**: **Private** (`public: false`)
- **Folder Convention**: `${userId}/${timestamp}_${sanitizedFilename}`
- **Security Access**:
  - Direct public access is disabled.
  - Express backend (`supabaseAdmin`) issues short-lived 1-hour signed access URLs (`createSignedUrl`) when admins request proof screenshot preview.

---

## 🛠️ Database Setup & Migration Execution

### Option A: Via Prisma CLI
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema directly to Supabase PostgreSQL
npm run --workspace=server prisma db push
```

### Option B: Via Supabase SQL Editor
Run the idempotent SQL script located at [docs/supabase_migration.sql](file:///c:/Users/Taheer/Desktop/Spendly/docs/supabase_migration.sql) directly inside the Supabase SQL Editor.
