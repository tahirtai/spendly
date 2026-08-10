# 🛠️ Spendly — Local Development & Setup Guide

This step-by-step guide explains how to clone, configure, build, and run the **Spendly** monorepo on a local development machine.

---

## 📋 Software Requirements

Before setting up Spendly, verify that your machine has the following tools installed:

- **Node.js**: Node 20 LTS (`v20.20.0` recommended)
- **npm**: `v10.x` or `v11.x`
- **Git**: Latest stable release
- **Supabase Account**: Managed Supabase project at [supabase.com](https://supabase.com)

---

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/tahirtai/spendly.git
cd spendly
```

### Step 2: Install Workspace Dependencies
Spendly uses `npm workspaces` to link `shared`, `server`, and `client`. Install dependencies reproducibly from the root:
```bash
npm ci
```

### Step 3: Configure Environment Variables

Create environment configuration files for both server and client:

#### 1. Server Environment Configuration (`server/.env`)
Copy the template file:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` with your actual Supabase credentials and database connection string:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase API Settings (From Supabase Dashboard > Settings > API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Direct Connection String (From Supabase Dashboard > Settings > Database)
DATABASE_URL=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres

# Seed Admin Credentials
ADMIN_EMAIL=admin@spendly.io
ADMIN_PASSWORD=your_secure_admin_password
```

#### 2. Client Environment Configuration (`client/.env`)
Copy the template file:
```bash
cp client/.env.example client/.env
```
Ensure `client/.env` points to your backend server URL:
```env
VITE_API_URL=http://localhost:5000
```

---

### Step 4: Configure Supabase Database & Storage

1. **Database Schema Creation**:
   - Option A: Run the database push command:
     ```bash
     npm run --workspace=server prisma db push
     ```
   - Option B: Copy the contents of `docs/supabase_migration.sql` and run it in **Supabase Dashboard > SQL Editor**.

2. **Storage Bucket Creation**:
   - In Supabase Dashboard, navigate to **Storage > Buckets**.
   - Create a private bucket named `payment-proofs`.

---

### Step 5: Build Shared Monorepo Package

Generate Prisma Client and compile the shared contracts:
```bash
# Generate Prisma Client TS bindings
npm run prisma:generate

# Build shared package
npm run build --workspace=shared
```

---

### Step 6: Start Development Servers

Run both backend Express server and frontend Vite server concurrently:
```bash
npm run dev
```

Once running:
- **Frontend SPA**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 📜 Monorepo Command Reference

All workspace commands can be run from the root directory:

| Command | Target | Description |
| :--- | :--- | :--- |
| `npm run dev` | Monorepo Root | Launches server and client concurrently in dev mode |
| `npm run build` | Monorepo Root | Compiles `shared`, `server`, and `client` for production |
| `npm run client` | `client/` | Runs Vite frontend dev server |
| `npm run server` | `server/` | Runs Express backend dev server |
| `npm run prisma:generate` | `server/` | Generates Prisma client TypeScript types |

---

## 🛠️ Troubleshooting & Frequently Asked Questions

### 1. `Cannot find module 'spendly-shared'`
- Solution: Run `npm run build --workspace=shared` to compile `shared/dist/index.js`.

### 2. `Invalid token` or `Authentication failed`
- Solution: Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env` match your active Supabase project credentials.

### 3. `File upload error: Only PNG, JPEG, and WEBP images are allowed`
- Solution: Ensure uploaded payment screenshot files use valid image formats (`.png`, `.jpg`, `.jpeg`, `.webp`) and remain under 5MB.
