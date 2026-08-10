# 📋 Spendly — Product Requirements Document (PRD)

**Version:** 1.0 (Final Production Audit)  
**Product Name:** Spendly  
**Type:** Monorepo SaaS-ready Hostel & PG Expense Management Platform  
**Status:** Production-Ready & Live in Production  

---

## 🌐 Production URLs

- **Production App**: [https://spendly-client-phi.vercel.app](https://spendly-client-phi.vercel.app)
- **Production API**: [https://spendly-api-n0jr.onrender.com](https://spendly-api-n0jr.onrender.com)
- **API Health Check**: [https://spendly-api-n0jr.onrender.com/health](https://spendly-api-n0jr.onrender.com/health)
- **Source Repository**: [https://github.com/tahirtai/spendly](https://github.com/tahirtai/spendly)

---

## 1. Product Vision & Problem Statement

### Vision
Spendly is a modern monorepo web and mobile-first application built to streamline financial management for hostel residents, PG occupants, and mess managers. It eliminates manual paper registers, disputed mess bills, and untracked expenditures through automated daily tiffin logging, categorized expense management, and admin-verified payment settlements.

### Problem Statement
Hostel and PG residents frequently experience:
- **Disputed Tiffin Charges**: Unclear logs regarding half meals, full meals, or skipped meals.
- **Unverified Payments**: Misplaced cash receipts or unverified UPI transactions causing confusion at month-end.
- **Rigid Historical Records**: Inability to view past monthly breakdowns when meal prices change.
- **Administrative Overhead**: Mess managers spending hours aggregating paper logs into manual calculations.

Spendly solves these issues by establishing a centralized digital workspace with instant balance calculations, uploaded payment proof verification, meal price versioning, and immutable monthly snapshots.

---

## 2. Target Users & Personas

1. **Hostel Resident / Student (`STUDENT`)**:
   - Needs quick daily meal logging (Half/Full/Skip).
   - Tracks personal daily expenditures (Food, Tea, Travel, Grocery).
   - Submits payment entries with UPI screenshot proof.
   - Monitors outstanding balance in real time.

2. **Mess Manager / Admin (`ADMIN`)**:
   - Oversees all student balances within the hostel workspace.
   - Reviews and approves/rejects pending UPI payment screenshot proofs.
   - Sets and updates workspace meal prices (Half price, Full price).
   - Locks past months to freeze snapshot balances.

3. **Hostel Super Admin (`SUPER_ADMIN`)**:
   - Manages role assignments (`STUDENT` <-> `ADMIN` <-> `SUPER_ADMIN`).
   - Maintains system integrity across workspaces.

---

## 3. Currently Implemented Features vs. Future Scope

### CURRENTLY IMPLEMENTED

- [x] **Supabase Authentication**: Registration & login via JWT bearer tokens.
- [x] **Workspace Isolation**: Default `SPENDLY_HOSTEL` workspace mapping members and financial records.
- [x] **One-Click Tiffin Logging**: Log daily lunch & dinner (`HALF`, `FULL`, `SKIP`) with automated cost computation.
- [x] **Missing Entry Alerts & Calendar**: Highlight unrecorded meal days in unlocked months via calendar views.
- [x] **Categorized Expense Tracker**: Log expenditures under pre-seeded categories (`Food`, `Tea`, `Snacks`, `Grocery`, `Laundry`, `Travel`, `Medical`, `Shopping`, `Other`).
- [x] **Payment Verification Portal**: Cash & UPI payment submission with direct Supabase Storage screenshot upload (`payment-proofs` bucket).
- [x] **Signed Payment Proof URLs**: Secure temporary 1-hour access to uploaded screenshots for admin verification.
- [x] **Admin Verification Workflow**: Approve or reject pending user payments; approved payments instantly reduce balance due.
- [x] **Meal Price Management**: Admin configurable `halfPrice` and `fullPrice` with retroactive stability.
- [x] **Month Locking & Snapshots**: Lock closed months to generate immutable `MonthlySnapshot` records.
- [x] **Monthly Reports & Analytics**: Interactive spending distribution charts (`Chart.js`) with CSV data export options.
- [x] **User Profile Management**: Update full name, phone number, and avatar URL.

---

### FUTURE / PLANNED SCOPE

- [ ] **Multi-Workspace Management UI**: Interface for creating and switching between multiple independent hostels or PG branches.
- [ ] **Online Payment Gateway Integration**: Automated instant payments via Razorpay / Paytm / Stripe integration.
- [ ] **WhatsApp & Push Notifications**: Automated reminders for unlogged meals and month-end pending dues.
- [ ] **Automated PDF Statement Export**: Native server-side PDF generation for monthly financial statements.
- [ ] **Room Rent & Utility Bill Splitting Module**: Module for handling fixed rent, electricity, and water bill distribution.

---

## 4. Detailed User Journeys

### User Journey 1: Daily Meal & Expense Logging
1. User logs in to Spendly and lands on the **Dashboard**.
2. Dashboard displays current month spending total, remaining balance due, meals logged this month, and missing entry alerts.
3. User navigates to **Tiffin Tracker**, selects today's lunch and dinner options (`Half`, `Full`, or `Skip`), and clicks **Save Meal**.
4. System calculates total cost based on active `MealPrice` rules and updates current balance.
5. User navigates to **Expenses**, enters amount, selects category `Tea`, adds an optional note, and submits.

### User Journey 2: Payment Proof Submission & Verification
1. User makes a UPI payment to hostel manager.
2. User opens **Payments** page in Spendly, selects payment type `UPI`, enters amount, attaches payment screenshot image, and submits.
3. Express server validates file (PNG/JPEG/WEBP under 5MB), uploads image to Supabase Storage (`payment-proofs` bucket), and saves payment with status `PENDING`.
4. Admin opens **Admin Panel -> Payment Verifications**, views pending payment list, and clicks **View Proof** to generate a signed access URL.
5. Admin verifies receipt accuracy and clicks **Approve**.
6. Payment status updates to `APPROVED`, automatically subtracting amount from student's balance due.

### User Journey 3: Month Locking & Snapshot Archival
1. At month-end, Admin opens **Admin Panel -> Month Locking**.
2. Admin reviews total meals, expenses, and payments for the target month (`YYYY-MM`) and clicks **Lock Month**.
3. Server aggregates user totals, calculates final `balanceDue`, updates or inserts `MonthlySnapshot` record with `isLocked = true`, and returns success.
4. Subsequent user attempts to modify meal/expense records for that locked month are rejected with validation errors.

---

## 5. Important Business & Data Validation Rules

1. **Date Format**: All dates are formatted as `YYYY-MM-DD`. Month identifiers are formatted as `YYYY-MM`.
2. **Meal Price Versioning**: Meal costs stored on the `Meal` record (`lunchCost`, `dinnerCost`, `totalCost`) preserve the pricing active at creation. Updating `MealPrice` does not alter existing records.
3. **Month Locking Integrity**: Neither users nor admins can insert, update, or delete meals or expenses in a month marked as locked (`isLocked = true`).
4. **File Upload Restrictions**: Screenshot uploads are strictly limited to images (`image/png`, `image/jpeg`, `image/webp`) with maximum file size of 5 MB.
5. **Role Security**: Registration defaults to `STUDENT`. Role upgrades to `ADMIN` or `SUPER_ADMIN` can only be performed by a `SUPER_ADMIN` via `/api/admin/members/:id/role`.

---

## 6. Success Metrics

- **Zero Calculation Discrepancies**: Automated backend calculations eliminate manual tallying errors.
- **Proof Verifiability**: 100% of UPI payments backed by uploaded screenshot proof.
- **Snapshot Immutability**: Closed month financial statements remain fixed and audit-ready.
