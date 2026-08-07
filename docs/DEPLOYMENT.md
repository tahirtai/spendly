# 🚀 Spendly — Production Deployment Guide

This document outlines deployment steps for production hosting of both the **Spendly Frontend** and **Backend Server**.

---

## 🎯 Architecture Summary

```
                      +-------------------+
                      |   Vercel / Netlify|
                      |  (React Vite App) |
                      +---------+---------+
                                |
                        HTTPS   | API Requests
                                v
                      +---------+---------+
                      |   Render / Railway|
                      | (Node Express API)|
                      +----+---------+----+
                           |         |
          Database Queries |         | Auth / Storage
                           v         v
                     +-----+---------+-----+
                     |  Supabase Postgres  |
                     |  & Storage Buckets  |
                     +---------------------+
```

---

## 1. Backend Deployment (Render / Railway / Render / DigitalOcean)

### Recommended Platform: **Render** / **Railway**

1. Create a new **Web Service** pointing to your GitHub repository.
2. Set Root Directory to: `server` (or run build from monorepo root).
3. Build Command:
   ```bash
   npm run build --workspace=shared && npm run build --workspace=server
   ```
4. Start Command:
   ```bash
   npm run start --workspace=server
   ```
5. Configure Environment Variables in Service Settings:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or platform default)
   - `CLIENT_URL`: `https://your-app.vercel.app`
   - `SUPABASE_URL`: `https://your-id.supabase.co`
   - `SUPABASE_ANON_KEY`: `your_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_service_role_key`
   - `DATABASE_URL`: `postgresql://postgres:password@db.your-id.supabase.co:5432/postgres`

---

## 2. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

### Recommended Platform: **Vercel**

1. Create a new project on Vercel importing your GitHub repository.
2. Select Root Directory: `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: `https://your-spendly-api.onrender.com`

---

## 3. Post-Deployment Verification

1. Verify server health endpoint: `https://your-api.com/api/health`
2. Test user login and authentication flow.
3. Test daily meal logging, daily expense creation, and UPI payment screenshot upload.
4. Verify admin payment approval workflows.
