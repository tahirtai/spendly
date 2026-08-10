# 🎨 Spendly — UI/UX Design Specification & Master System

This document outlines the UI design system, color tokens, glassmorphism specs, mobile-first component hierarchy, and Stitch HTML references for **Spendly**.

---

## 💎 Design System Architecture: Lumina Glassmorphism

Spendly uses a mobile-first **Lumina Glassmorphism** design system engineered using Vanilla CSS variables and Tailwind CSS 3.4.

### Core Visual Aesthetics
1. **Glassmorphism Backdrop Blur**: Semi-transparent card layers (`backdrop-blur-xl bg-white/70`, `dark:bg-slate-900/80`) featuring subtle borders (`border border-white/20 dark:border-slate-800/50`).
2. **Dynamic Gradients**: Vibrant primary accents (`from-indigo-600 to-violet-600`, `from-emerald-500 to-teal-600`, `from-amber-500 to-orange-500`).
3. **Typography**: Google Font **Inter** for clean readability and **Outfit/Geist** for crisp headlines and badge indicators.
4. **Micro-Animations**: Framer Motion subtle hover effects, active scale state feedback (`active:scale-95`), and smooth tab transitions.

---

## 🎨 Color Palette & Tokens

| Token | Hex / Class | Application |
| :--- | :--- | :--- |
| **Primary Indigo** | `#6366f1` / `bg-indigo-600` | Branding, primary CTAs, active bottom nav items |
| **Success Emerald**| `#10b981` / `bg-emerald-500` | Approved payments, full meal badges, positive balances |
| **Warning Amber**  | `#f59e0b` / `bg-amber-500` | Pending verifications, half meal badges, missing entry alerts |
| **Rose Red**       | `#ef4444` / `bg-rose-500` | Rejected payments, skip meal badges, delete actions |
| **Slate Background**| `#f8fafc` / `bg-slate-50` | App container background |
| **Glass Card**     | `bg-white/80 border-white/40` | Mobile card containers and modal overlays |

---

## 📱 Mobile-First Layout Architecture

```
+-------------------------------------------------------+
|                    DESKTOP CONTAINER                  |
|  +-------------------------------------------------+  |
|  |                 MOBILE APP FRAME                |  |
|  |  +-------------------------------------------+  |  |
|  |  | TOP HEADER                                |  |  |
|  |  | Spendly Logo | Title | User Avatar Menu   |  |  |
|  |  +-------------------------------------------+  |  |
|  |  | SCROLLABLE MAIN VIEW CONTENT              |  |  |
|  |  | (Dashboard / Tiffin / Expenses / Payments) |  |  |
|  |  |                                           |  |  |
|  |  +-------------------------------------------+  |  |
|  |  | BOTTOM NAVIGATION BAR (AppShell)          |  |  |
|  |  | Home | Tiffin | Expenses | Payments | Admin|  |  |
|  |  +-------------------------------------------+  |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
```

### Component Structure (`client/src/components/`)
- `AppShell.tsx`: Mobile app wrapper containing top header, avatar dropdown, and fixed bottom navigation bar.
- `SpendlyLogo.tsx`: SVG vector logo with glowing gradient icon.
- `SplashScreen.tsx`: Initial animated splash screen displayed on app boot.
- `UserAvatar.tsx`: Avatar fallback showing initials or custom uploaded avatar image.
- `auth-switch.tsx`: Glassmorphic auth card supporting fluid toggle between Login and Registration forms.

---

## 📄 Implemented Page Modules & Design Mappings

| Module | React Component Path | Key Visual Features |
| :--- | :--- | :--- |
| **Landing** | `client/src/modules/landing/LandingView.tsx` | Hero section, feature grids, statistics, glassmorphic CTA buttons |
| **Auth** | `client/src/modules/auth/LoginView.tsx` | Glassmorphic card toggle (`auth-switch.tsx`) with instant form validation |
| **Dashboard** | `client/src/modules/dashboard/DashboardView.tsx` | Balance summary cards, meal log quick buttons, missing entry banner |
| **Tiffin Tracker**| `client/src/modules/tiffin/TiffinView.tsx` | Lunch/Dinner half/full/skip pickers, monthly calendar missing days grid |
| **Expenses** | `client/src/modules/expenses/ExpensesView.tsx` | Category pill selectors, expense list with date tags, custom note inputs |
| **Payments** | `client/src/modules/payments/PaymentsView.tsx` | Payment method toggle (Cash vs UPI), drag-and-drop screenshot uploader |
| **History** | `client/src/modules/history/HistoryView.tsx` | Locked month badges, snapshot balance breakdown, historical detail modal |
| **Reports** | `client/src/modules/reports/ReportsView.tsx` | Chart.js donut and bar charts, category breakdown percentage bars |
| **Admin** | `client/src/modules/admin/AdminView.tsx` | Admin tabs for Member Balances, Payment Verifications, Price Config, Month Locking |
| **Profile** | `client/src/modules/profile/ProfileView.tsx` | User profile card, phone/avatar editor, role badge indicator |

---

## 🖼️ Historical Stitch HTML Design Reference Files

The HTML design exports downloaded from Stitch remain available in the repository as visual references:
- Landing Page: `mobile view design/landing_page_mobile/code.html`
- Login Interaction: `mobile view design/login_page_animated_interaction/code.html`
- Dashboard: `mobile view design/user_dashboard_mobile/code.html`
- Tiffin Tracker: `mobile view design/tiffin_tracker_mobile/code.html`
- Expense Logger: `mobile view design/daily_expense_logger_mobile/code.html`
- Payment Submission: `mobile view design/payment_page_mobile/code.html`
- Monthly History: `mobile view design/monthly_history_mobile/code.html`
- Reports Analytics: `mobile view design/reports_analytics_mobile/code.html`
- Admin Panel: `mobile view design/admin_panel_mobile/code.html`
- Super Admin: `mobile view design/super_admin_panel_mobile/code.html`
