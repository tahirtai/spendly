# 🍱 Spendly — Modern Hostel & PG Expense Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

**Spendly** is a production-ready, full-stack SaaS platform designed for hostel and PG residents to seamlessly manage daily tiffin meal logs, personal categorized expenses, and payment proof verifications.

Built with a modular TypeScript monorepo architecture (`shared`, `server`, `client`), Spendly provides real-time monthly financial tracking, automated meal calculations, immutable historical snapshots, and an intuitive Admin management panel.

---

## 📸 Product Screenshots

| Dashboard Overview | Daily Tiffin Log |
| :---: | :---: |
| ![Dashboard Screenshot](docs/assets/dashboard.png) | ![Tiffin Screenshot](docs/assets/tiffin.png) |

| Payments & UPI Proof | Admin Control Panel |
| :---: | :---: |
| ![Payments Screenshot](docs/assets/payments.png) | ![Admin Screenshot](docs/assets/admin.png) |

*(Note: Add actual screenshots to `docs/assets/` when deploying to production)*

---

## ✨ Features

- 🍱 **One-Click Tiffin Tracking**: Log daily lunch and dinner meals (Half, Full, Skip) with automatic price calculations.
- 📆 **Missing Entry Detection**: Built-in calendar modal alerts users to unrecorded days in unlocked months.
- 💸 **Categorized Expenses**: Track personal daily expenditures (Food, Grocery, Travel, Shopping, Medical).
- 💳 **Payment Logs & UPI Screenshot Upload**: Submit cash or UPI payment logs with image proof directly to Supabase Storage.
- 🛡️ **Role-Based Access Control**: Secure Student, Admin, and Super Admin roles with Supabase Auth (JWT).
- 🔒 **Month Locking & Price Versioning**: Admins can lock closed months to generate immutable snapshots. Meal price updates apply only to future logs.
- 📊 **Monthly Reports & Snapshots**: Automated aggregation of monthly totals with PDF and CSV export capabilities.
- ⚡ **Real-time Balance Settlement**: Approved payments instantly update user remaining balances.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | SPA framework and fast dev server |
| **Styling** | Tailwind CSS, Lucide Icons | Responsive modern UI design system |
| **State Management**| Zustand | Lightweight client-side state management |
| **Backend** | Node.js, Express.js, TypeScript | RESTful API server & middleware |
| **Database** | PostgreSQL, Prisma ORM | Relational data persistence & type-safe ORM |
| **Authentication** | Supabase Auth | JWT bearer tokens & role authorization |
| **Storage** | Supabase Storage | Proof of payment image bucket hosting |
| **Monorepo** | npm Workspaces | Shared TypeScript interfaces & types |

---

## 📐 Architecture Overview

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
 Shared Types                  Express API                   React Vite SPA
 Zod Validation Schemas        Prisma ORM                    Tailwind UI
 API DTO Contracts             Supabase Admin Client         Zustand Store
```

---

## 📁 Repository Folder Structure

```
spendly/
├── client/                  # Frontend React SPA (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Modals, Headers)
│   │   ├── lib/             # API client & date utilities
│   │   ├── modules/         # Feature modules (Dashboard, Tiffin, Expenses, Admin, etc.)
│   │   └── store/           # Zustand state management stores
│   └── package.json
├── server/                  # Backend Node.js Express API
│   ├── prisma/              # Prisma DB Schema (`schema.prisma`)
│   ├── src/
│   │   ├── lib/             # Supabase & Prisma clients
│   │   ├── routes/          # API route handlers & middleware
│   │   └── index.ts         # Express server entry point
│   └── package.json
├── shared/                  # Shared TypeScript types & contracts
│   └── src/
│       └── index.ts         # Enums, interfaces, and validation schemas
├── docs/                    # Project documentation & specs
│   ├── PRD.md               # Product Requirements Document
│   ├── TRD.md               # Technical Requirements Document
│   ├── STITCH_DESIGN_SPEC.md# Master UI design specification & blueprint
│   ├── supabase_migration.sql # Raw Supabase SQL migration script
│   ├── SETUP.md             # Detailed local development guide
│   ├── DATABASE.md          # Database schema & Supabase setup
│   ├── DEPLOYMENT.md        # Production deployment guide
│   └── SECURITY.md          # Security guidelines
├── .env.example             # Monorepo environment variable template
├── .gitignore               # Version control ignore definitions
├── LICENSE                  # MIT License
└── package.json             # Monorepo workspace configuration
```

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/spendly.git
cd spendly
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to PostgreSQL/Supabase
npm run --workspace=server prisma db push

# Seed initial Super Admin account
npm run --workspace=server seed
```

### 4. Build Shared Package & Run Dev Server
```bash
# Build shared TypeScript package
npm run build --workspace=shared

# Start server and client concurrently
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

For comprehensive setup details, see [docs/SETUP.md](docs/SETUP.md).

---

## 🔑 Environment Variables

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Server | Express API server port | `5000` |
| `CLIENT_URL` | Server | Allowed CORS client origin | `http://localhost:5173` |
| `SUPABASE_URL` | Server | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Server | Supabase public anon key | `<your_supabase_anon_key>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase service role admin key | `<your_supabase_service_role_key>` |
| `DATABASE_URL` | Server | Direct PostgreSQL connection string | `postgresql://...` |
| `VITE_API_URL` | Client | Frontend API base URL | `http://localhost:5000` |

---

## 📜 Available NPM Scripts

- `npm run dev`: Launch client and server concurrently in development mode.
- `npm run build`: Compile `shared`, `server`, and `client` for production.
- `npm run client`: Run Vite frontend dev server.
- `npm run server`: Run Express backend dev server.
- `npm run prisma:generate`: Generate Prisma Client TS definitions.

---

## 🚀 Deployment

- **Frontend**: Deploy `client/` to **Vercel** or **Netlify**.
- **Backend**: Deploy `server/` to **Render**, **Railway**, or **DigitalOcean App Platform**.
- **Database & Storage**: Hosted on **Supabase**.

Read full deployment instructions in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 🗺️ Roadmap & Future Features

- [ ] **Multi-Hostel Room Rent Module**
- [ ] **Shared PG Utility Bills Splitting**
- [ ] **Razorpay / Stripe Payment Gateway Integration**
- [ ] **WhatsApp & Push Notifications for Unpaid Dues**
- [ ] **Mobile App (React Native)**

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a Pull Request following these steps:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 👨‍💻 Author

Crafted with care for students and hostel managers.

- **GitHub**: [@your-username](https://github.com/your-username)
- **Project Repo**: [https://github.com/your-username/spendly](https://github.com/your-username/spendly)
