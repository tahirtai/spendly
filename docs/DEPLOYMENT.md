# 🚀 Spendly — Production Deployment Architecture & Guide

This document outlines the deployment topology, build configurations, platform settings, and security checks required to run **Spendly** in production environments.

---

## 🎯 Production Architecture Topology

```
+-----------------------------------------------------------------------+
|                         PRODUCTION ARCHITECTURE                       |
+-----------------------------------------------------------------------+

     +-------------------------------------------------------------+
     |                       Vercel / Netlify                      |
     |             Frontend SPA (React 18 + Vite 5 + TS)           |
     |                       (https://spendly.app)                 |
     +------------------------------+------------------------------+
                                    |
                         HTTPS CORS | API Requests
                                    v
     +------------------------------+------------------------------+
     |                  Render / Railway / Docker Container        |
     |                  Backend Server (Node Express API)          |
     |                 (https://api.spendly.app:5000)              |
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

## 2. Backend Server Deployment (Render / Railway / Cloud Web Service)

### Target Platforms
Render Web Service, Railway Service, AWS App Runner, or DigitalOcean App Platform.

### Configuration Settings
- **Root Directory**: `./` (Monorepo root) or `server/`
- **Node Version**: `20.x` LTS
- **Build Command**:
  ```bash
  npm run build --workspace=shared && npm run build --workspace=server
  ```
- **Start Command**:
  ```bash
  npm run start --workspace=server
  ```
- **Health Check Path**: `/health` (Returns `{ status: 'ok', service: 'Spendly API' }`)

### Production Environment Variables (`server`)
| Variable | Value Description |
| :--- | :--- |
| `PORT` | `5000` or platform `$PORT` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Production client origin (e.g. `https://spendly.app`) |
| `SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key |
| `DATABASE_URL` | Connection string: `postgresql://postgres:PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?sslmode=require` |

---

## 3. Frontend Client Deployment (Vercel / Netlify / Cloudflare Pages)

### Target Platforms
Vercel, Netlify, or Cloudflare Pages.

### Configuration Settings
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (or from root `npm run build --workspace=client`)
- **Output Directory**: `dist`
- **Single Page Application Routing**: Enable rewrite rule routing all paths to `/index.html`.

### Production Environment Variables (`client`)
| Variable | Value Description |
| :--- | :--- |
| `VITE_API_URL` | Production API domain (e.g. `https://api.spendly.app`) |

---

## 4. Database & Storage Production Setup (Supabase)

1. **Database Schema**: Ensure database tables, indexes, and constraints match `docs/supabase_migration.sql` or run `npm run --workspace=server prisma db push`.
2. **Storage Bucket**: Ensure private bucket `payment-proofs` exists in Supabase Storage with public access set to `false`.
3. **SSL Mode**: Ensure `DATABASE_URL` specifies `?sslmode=require` for production database traffic encryption.

---

## 5. Pre-Flight & Post-Deployment Checklist

- [ ] Backend API responds with HTTP 200 on `/health`.
- [ ] CORS middleware allows requests ONLY from specified `CLIENT_URL`.
- [ ] User authentication (Login & Registration) executes without CORS or JWT errors.
- [ ] Tiffin meal logging updates balance in real time.
- [ ] Payment screenshot upload succeeds to private `payment-proofs` bucket.
- [ ] Signed URLs generate correctly for Admin payment verification previews.
- [ ] No `.env` files or hardcoded credentials exist in production source code.
