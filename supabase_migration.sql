-- ============================================================
-- Spendly - Supabase Database Migration
-- Run this SQL in: Supabase Dashboard > SQL Editor
-- Compatible with: PostgreSQL 15+ (Supabase)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── Enums ───────────────────────────────────────────────────
-- Using DO $$ ... $$ blocks to safely create enums only if they
-- do not already exist (PostgreSQL has no CREATE TYPE IF NOT EXISTS).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MealOption') THEN
    CREATE TYPE "MealOption" AS ENUM ('HALF', 'FULL', 'SKIP');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentType') THEN
    CREATE TYPE "PaymentType" AS ENUM ('CASH', 'UPI');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MonthStatus') THEN
    CREATE TYPE "MonthStatus" AS ENUM ('OPEN', 'CLOSED', 'PAID', 'PENDING');
  END IF;
END
$$;


-- ─── Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Workspace" (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text        NOT NULL,
  code        text        NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "User" (
  id          text        PRIMARY KEY,   -- mirrors auth.users.id (UUID stored as text)
  email       text        NOT NULL UNIQUE,
  "fullName"  text        NOT NULL,
  phone       text,
  "avatarUrl" text,
  role        "Role"      NOT NULL DEFAULT 'STUDENT',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "WorkspaceMember" (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId" uuid        NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId"      text        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role          "Role"      NOT NULL DEFAULT 'STUDENT',
  "joinedAt"    timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("workspaceId", "userId")
);

CREATE TABLE IF NOT EXISTS "MealPrice" (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId"   uuid        NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "halfPrice"     float       NOT NULL DEFAULT 40,
  "fullPrice"     float       NOT NULL DEFAULT 60,
  "effectiveFrom" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Meal" (
  id            uuid         PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId" uuid         NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId"      text         NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  date          date         NOT NULL,
  lunch         "MealOption" NOT NULL DEFAULT 'SKIP',
  dinner        "MealOption" NOT NULL DEFAULT 'SKIP',
  "lunchCost"   float        NOT NULL DEFAULT 0,
  "dinnerCost"  float        NOT NULL DEFAULT 0,
  "totalCost"   float        NOT NULL DEFAULT 0,
  "createdAt"   timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz  NOT NULL DEFAULT now(),
  UNIQUE ("workspaceId", "userId", date)
);

CREATE TABLE IF NOT EXISTS "ExpenseCategory" (
  id          uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text    NOT NULL UNIQUE,
  "isDefault" boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Expense" (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId" uuid        NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId"      text        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  category      text        NOT NULL,
  amount        float       NOT NULL,
  note          text,
  date          date        NOT NULL,
  "createdAt"   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Payment" (
  id               uuid            PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId"    uuid            NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId"         text            NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type             "PaymentType"   NOT NULL,
  amount           float           NOT NULL,
  "screenshotPath" text,
  note             text,
  date             date            NOT NULL,
  status           "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedBy"     text,
  "createdAt"      timestamptz     NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "MonthlySnapshot" (
  id             uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId"  uuid          NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "userId"       text          NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  month          text          NOT NULL,   -- Format: YYYY-MM
  "mealTotal"    float         NOT NULL DEFAULT 0,
  "expenseTotal" float         NOT NULL DEFAULT 0,
  "paymentTotal" float         NOT NULL DEFAULT 0,
  "balanceDue"   float         NOT NULL DEFAULT 0,
  status         "MonthStatus" NOT NULL DEFAULT 'OPEN',
  "isLocked"     boolean       NOT NULL DEFAULT false,
  "createdAt"    timestamptz   NOT NULL DEFAULT now(),
  UNIQUE ("workspaceId", "userId", month)
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workspaceId" uuid        NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "actorId"     text        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action        text        NOT NULL,
  resource      text        NOT NULL,
  "oldValue"    jsonb,
  "newValue"    jsonb,
  "createdAt"   timestamptz NOT NULL DEFAULT now()
);


-- ─── Indexes ─────────────────────────────────────────────────
-- CREATE INDEX IF NOT EXISTS is valid PostgreSQL 9.5+

CREATE INDEX IF NOT EXISTS idx_meal_user_date        ON "Meal"("userId", date);
CREATE INDEX IF NOT EXISTS idx_expense_user_date     ON "Expense"("userId", date);
CREATE INDEX IF NOT EXISTS idx_payment_user_status   ON "Payment"("userId", status);
CREATE INDEX IF NOT EXISTS idx_snapshot_user_month   ON "MonthlySnapshot"("userId", month);
CREATE INDEX IF NOT EXISTS idx_workspace_member_user ON "WorkspaceMember"("userId");


-- ─── Row Level Security ───────────────────────────────────────
-- The Express server uses a SERVICE ROLE KEY which bypasses RLS.
-- These policies guard against direct client-side Supabase SDK access.
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY is idempotent — safe to re-run.

ALTER TABLE "User"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMember"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPrice"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Meal"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseCategory"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MonthlySnapshot"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"         ENABLE ROW LEVEL SECURITY;


-- ─── RLS Policies ────────────────────────────────────────────
-- PostgreSQL does NOT support CREATE POLICY IF NOT EXISTS.
-- Safe pattern: DROP POLICY IF EXISTS first, then CREATE POLICY.

-- User: read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON "User";
CREATE POLICY "Users can read own profile"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Meal: read own meals
DROP POLICY IF EXISTS "Users can read own meals" ON "Meal";
CREATE POLICY "Users can read own meals"
  ON "Meal"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Expense: read own expenses
DROP POLICY IF EXISTS "Users can read own expenses" ON "Expense";
CREATE POLICY "Users can read own expenses"
  ON "Expense"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Payment: read own payments
DROP POLICY IF EXISTS "Users can read own payments" ON "Payment";
CREATE POLICY "Users can read own payments"
  ON "Payment"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- MonthlySnapshot: read own snapshots
DROP POLICY IF EXISTS "Users can read own snapshots" ON "MonthlySnapshot";
CREATE POLICY "Users can read own snapshots"
  ON "MonthlySnapshot"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- WorkspaceMember: read own membership rows
DROP POLICY IF EXISTS "Users can read own workspace membership" ON "WorkspaceMember";
CREATE POLICY "Users can read own workspace membership"
  ON "WorkspaceMember"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- ExpenseCategory: public read (no auth required)
DROP POLICY IF EXISTS "Anyone can read expense categories" ON "ExpenseCategory";
CREATE POLICY "Anyone can read expense categories"
  ON "ExpenseCategory"
  FOR SELECT
  USING (true);

-- MealPrice: public read (needed by unauthenticated price display)
DROP POLICY IF EXISTS "Anyone can read meal prices" ON "MealPrice";
CREATE POLICY "Anyone can read meal prices"
  ON "MealPrice"
  FOR SELECT
  USING (true);

-- Workspace: members can read their workspace
DROP POLICY IF EXISTS "Members can read their workspace" ON "Workspace";
CREATE POLICY "Members can read their workspace"
  ON "Workspace"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "WorkspaceMember"
      WHERE "WorkspaceMember"."workspaceId" = "Workspace".id
        AND "WorkspaceMember"."userId" = auth.uid()::text
    )
  );


-- ─── Supabase Storage Bucket ──────────────────────────────────
-- Creates the private bucket for UPI payment screenshots.
-- The INSERT is safe on re-runs because of ON CONFLICT DO NOTHING.

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload own payment proofs" ON storage.objects;
CREATE POLICY "Users can upload own payment proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policy: users can read their own files; admins can read all
DROP POLICY IF EXISTS "Users can read own payment proofs" ON storage.objects;
CREATE POLICY "Users can read own payment proofs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ─── Seed: Default Expense Categories ────────────────────────
-- ON CONFLICT (name) DO NOTHING makes this safe to re-run.

INSERT INTO "ExpenseCategory" (name, "isDefault")
VALUES
  ('Food',     true),
  ('Tea',      true),
  ('Snacks',   true),
  ('Grocery',  true),
  ('Laundry',  true),
  ('Travel',   true),
  ('Medical',  true),
  ('Shopping', true),
  ('Other',    true)
ON CONFLICT (name) DO NOTHING;
