# 🗄️ Spendly — Database & Supabase Guide

This document describes the database schema, Prisma configuration, Supabase setup, and storage bucket requirements for **Spendly**.

---

## 🏗️ Schema Overview

Spendly uses **PostgreSQL** hosted on **Supabase** with **Prisma ORM** for type-safe database queries.

```
+-------------------+      +--------------------+      +--------------------+
|     User (Auth)   | ---> |     Workspace      | ---> |     MealPrice      |
+-------------------+      +--------------------+      +--------------------+
          |                          |
          v                          v
+-------------------+      +--------------------+
|    MealEntry      |      |   DailyExpense     |
+-------------------+      +--------------------+
          |                          |
          v                          v
+-------------------+      +--------------------+
|      Payment      |      |  MonthlySnapshot   |
+-------------------+      +--------------------+
```

---

## 📊 Database Models

### 1. `User`
Stores user profile information synced with Supabase Auth.
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `name`: String
- `role`: Enum (`STUDENT`, `ADMIN`, `SUPER_ADMIN`)
- `workspaceId`: UUID (Foreign Key)

### 2. `Workspace`
Represents a hostel or PG unit.
- `id`: UUID (Primary Key)
- `name`: String
- `code`: String (Unique, e.g. `HOSTEL-A1`)

### 3. `MealPrice`
Versioned pricing for tiffin meals.
- `id`: UUID
- `workspaceId`: UUID
- `halfPrice`: Decimal
- `fullPrice`: Decimal
- `effectiveFrom`: DateTime

### 4. `MealEntry`
Daily meal records.
- `id`: UUID
- `userId`: UUID
- `date`: String (`YYYY-MM-DD`)
- `lunch`: Enum (`HALF`, `FULL`, `SKIP`)
- `dinner`: Enum (`HALF`, `FULL`, `SKIP`)
- `cost`: Decimal

### 5. `DailyExpense`
Personal categorized daily expenses.
- `id`: UUID
- `userId`: UUID
- `category`: String
- `amount`: Decimal
- `note`: String
- `date`: String (`YYYY-MM-DD`)

### 6. `Payment`
Payment logs and verification proof.
- `id`: UUID
- `userId`: UUID
- `amount`: Decimal
- `type`: Enum (`CASH`, `UPI`)
- `proofUrl`: String (Supabase Storage URL for UPI screenshots)
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `note`: String
- `date`: String (`YYYY-MM-DD`)

### 7. `MonthlySnapshot`
Immutable end-of-month snapshot records.
- `id`: UUID
- `userId`: UUID
- `month`: String (`YYYY-MM`)
- `totalMeals`: Decimal
- `totalExpenses`: Decimal
- `totalPaid`: Decimal
- `balance`: Decimal
- `status`: Enum (`OPEN`, `LOCKED`)

---

## 📦 Supabase Storage Setup

UPI proof screenshots are stored in Supabase Storage.

### Storage Bucket Setup Steps:
1. Log into [Supabase Dashboard](https://app.supabase.com).
2. Navigate to **Storage > Buckets**.
3. Create a new bucket named: `payment-proofs`.
4. Enable **Public Bucket** toggle.
5. Add an RLS Policy to allow authenticated users to upload files and public readers to view proof images.

---

## 🔄 Migrations & Database Commands

### Apply Schema to Supabase PostgreSQL:
```bash
npm run --workspace=server prisma db push
```

### Export SQL Schema / Supabase Migration Script:
The raw SQL migration file is stored in `docs/supabase_migration.sql` for direct execution via Supabase SQL Editor if needed.
