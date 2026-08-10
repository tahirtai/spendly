# 🚀 Spendly — Production Deployment Architecture & Guide

This document outlines the live deployment topology, build configurations, platform settings, environment variables, and verification steps for **Spendly** in production.

---

## 🌐 Production Architecture Topology

```
+-----------------------------------------------------------------------+
|                         LIVE PRODUCTION TOPOLOGY                      |
+-----------------------------------------------------------------------+

     +-------------------------------------------------------------+
     |                       Vercel (Client SPA)                   |
     |             Frontend SPA (React 18 + Vite 5 + TS)           |
     |          (https://spendly-client-phi.vercel.app)            |
     +------------------------------+------------------------------+
                                    |
                         HTTPS CORS | API Requests
                                    v
     +------------------------------+------------------------------+
     |                    Render (Express API Service)              |
     |                    Service: spendly-api                     |
     |           (https://spendly-api-n0jr.onrender.com)           |
     +-------------------+---------------------+-------------------+
                         |                     |
        Direct SQL Pool  |                     | Service-Role REST
                         v                     v
     +-------------------+---------------------+-------------------+
     |                     Supabase Cloud Platform                 |
     |   - PostgreSQL 15 Database (Prisma ORM Managed)             |
     |   - Supabase Auth (JWT Provider)                            |
     |   - Supabase Storage (Private `payment-proofs` Bucket)      |
     +-------------------------------------------------------------+
```

---

## 1. Monorepo Build Command Execution

To compile all 3 packages (`shared`, `server`, `client`) for production deployment:

```bash
npm run build
```

This root script sequentially triggers:
1. `npm run build --workspace=shared` -> Compiles TypeScript schemas to `shared/dist`.
2. `npm run build --workspace=server` -> Compiles Express API to `server/dist`.
3. `npm run build --workspace=client` -> Compiles Vite frontend SPA to `client/dist`.

---

## 2. Backend Server Deployment (Render)

### Live Service Configuration
- **Platform**: Render (Web Service)
- **Service Name**: `spendly-api`
- **Repository**: [https://github.com/tahirtai/spendly](https://github.com/tahirtai/spendly)
- **Branch**: `main`
- **Node.js Version**: `20.20.0` (Pinned via `.node-version` and `"engines": { "node": ">=20.0.0 <21.0.0" }`)
- **Build Command**:
  ```bash
  npm ci && npm run build --workspace=shared && npm run build --workspace=server
  ```
- **Start Command**:
  ```bash
  npm run start --workspace=server
  ```
- **Public API URL**: `https://spendly-api-n0jr.onrender.com`
- **Health Check Endpoint**: `https://spendly-api-n0jr.onrender.com/health` (Returns `{ status: 'ok', service: 'Spendly API' }`)

### Production Environment Variables (`Render`)
> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to Vercel client-side code. It belongs strictly in Render server environment variables.

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | Auto-configured by Render (Dynamic port injection) |
| `CLIENT_URL` | `https://spendly-client-phi.vercel.app` |
| `SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anonymous Public Key |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key |
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require` |

---

## 3. Frontend Client Deployment (Vercel)

### Live Platform Configuration
- **Platform**: Vercel
- **Project Name**: `spendly-client`
- **Repository**: [https://github.com/tahirtai/spendly](https://github.com/tahirtai/spendly)
- **Branch**: `main`
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (or `tsc && vite build`)
- **Output Directory**: `dist`
- **Production URL**: [https://spendly-client-phi.vercel.app](https://spendly-client-phi.vercel.app)

### Production Environment Variables (`Vercel`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | `https://spendly-api-n0jr.onrender.com` |

---

## 4. Supabase Cloud Setup

1. **Database Schema**: PostgreSQL database tables, indexes, and constraints match `server/prisma/schema.prisma` and `docs/supabase_migration.sql`.
2. **Storage Bucket**: Private bucket `payment-proofs` in Supabase Storage with public access set to `false`.
3. **Signed URLs**: Generates 1-hour access URLs for admin verification previews.

---

## 5. Render Free Tier Behavior Note

> [!NOTE]
> The backend Web Service on Render is hosted on the Free Tier. Render automatically spins down free web services after **15 minutes of inactivity**. The first HTTP request after a spin-down may take **30 to 50 seconds** to complete while the container boots up. Subsequent requests respond instantly. This is hosting provider infrastructure behavior and does not represent an application error.

---

## 6. Pre-Flight & Post-Deployment Checklist

- [x] Backend API responds with HTTP 200 on `GET https://spendly-api-n0jr.onrender.com/health`.
- [x] CORS middleware restricts origins to `https://spendly-client-phi.vercel.app`.
- [x] User authentication (Login & Registration) executes cleanly.
- [x] Tiffin meal logging computes prices correctly.
- [x] Payment screenshot upload succeeds to private `payment-proofs` bucket.
- [x] Signed URLs generate correctly for Admin payment verification previews.
- [x] Zero secrets committed to Git repository.
