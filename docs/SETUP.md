# 🛠️ Spendly — Local Setup & Development Guide

This guide walks you through setting up and running the **Spendly** monorepo locally.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (Recommended: LTS `v20.x`)
- **npm**: `v9.x` or higher
- **PostgreSQL**: PostgreSQL instance or a free Supabase project
- **Git**: For version control

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/spendly.git
cd spendly
```

### 2. Install Dependencies

Spendly uses **npm workspaces** to manage packages across `client`, `server`, and `shared`.

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` templates to create local `.env` files:

#### Server Environment (`server/.env`)
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your actual Supabase credentials and database URL:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

ADMIN_EMAIL=admin@spendly.io
ADMIN_PASSWORD=SuperAdminPassword123!
```

#### Client Environment (`client/.env`)
```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000
```

### 4. Database Setup & Prisma Generation

Generate the Prisma client code for the backend:

```bash
npm run prisma:generate
```

Push the database schema to your PostgreSQL database:

```bash
npm run --workspace=server prisma db push
```

*(Optional)* Seed initial admin account and default meal prices:

```bash
npm run --workspace=server seed
```

### 5. Build Shared Library

Build the shared TypeScript contracts used by both client and server:

```bash
npm run build --workspace=shared
```

### 6. Run the Application

Start both client and server concurrently in development mode:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📜 Monorepo Scripts Overview

| Command | Workspace | Description |
| :--- | :--- | :--- |
| `npm run dev` | Monorepo Root | Starts server and client concurrently |
| `npm run build` | Monorepo Root | Builds shared, server, and client for production |
| `npm run client` | client | Starts Vite development server for client |
| `npm run server` | server | Starts Express development server |
| `npm run prisma:generate` | server | Generates Prisma client bindings |

---

## 🛠️ Troubleshooting Common Issues

### Issue 1: CORS Error on API Calls
- Ensure `CLIENT_URL` in `server/.env` matches `http://localhost:5173`.
- Verify the server is running on port 5000.

### Issue 2: Prisma Client Not Generated
- Run `npm run prisma:generate` manually from root or inside `server/`.

### Issue 3: Supabase Authentication Errors
- Double-check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `server/.env`.
- Ensure email authentication is enabled in your Supabase Dashboard under **Authentication > Providers**.
