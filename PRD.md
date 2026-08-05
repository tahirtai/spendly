# 📋 Spendly — Product Requirements Document (PRD)

**Version:** 1.0 (MVP)  
**Product Name:** Spendly  
**Type:** SaaS-ready Hostel & PG Expense Management Platform  
**Current Scope:** Tiffin + Daily Expenses  
**Future Scope:** Complete Hostel Management Platform  

---

## 1. Vision

Spendly is a modern web application designed to help hostel and PG residents effortlessly track recurring expenses, beginning with tiffin and daily expenses. 

The MVP focuses on eliminating manual calculations and payment disputes by automatically calculating totals, maintaining monthly history, and securely storing payment records.

The architecture must be modular, scalable, and production-ready so future modules can be added without major refactoring.

---

## 2. Goals

### Primary Goals
* **One-click meal tracking**: Quick logging of daily lunch and dinner meals (Half, Full, Skip).
* **Automatic monthly calculation**: Real-time aggregation of meal costs based on versioned meal prices.
* **Daily expense management**: Categorized expense tracking with custom notes and default categories.
* **Payment tracking & verification**: Cash and UPI payment logging with admin approval workflow.
* **UPI proof upload**: Secure storage and preview of payment screenshots.
* **Monthly snapshots & reports**: Immutable end-of-month financial snapshots with PDF/CSV export options.
* **Admin panel**: User management, payment verification, meal price configuration, and month locking.
* **Secure authentication**: Role-based access control (Student, Admin, Super Admin) powered by Supabase Auth.
* **Production-ready architecture**: Scalable multi-workspace support.

---

## 3. Non-Goals (MVP)

The following modules are **explicitly out of scope for the MVP** and will display as "Coming Soon" in the interface:
* Room Rent
* Electricity & Water Bills
* Laundry Services
* Shared Expenses
* Visitor Management & Attendance
* Push Notifications & Mobile App
* Online Payment Gateway Integration

---

## 4. User Roles & Permissions

| Role | Key Permissions | Restrictions |
| :--- | :--- | :--- |
| **Student** | • Register / Login<br>• Record meals & daily expenses<br>• Upload UPI payment proof<br>• View own monthly reports & history | • Cannot view or modify other users' data<br>• Cannot access Admin Panel |
| **Admin** | • All Student capabilities<br>• View students in workspace<br>• Verify/Approve payments<br>• Manage workspace meal prices<br>• Lock/Unlock months<br>• Export workspace reports | • Cannot promote users to Admin<br>• Cannot delete workspace |
| **Super Admin** | • Full system permissions<br>• Promote/Demote Admins<br>• Create & delete users/workspaces<br>• Manage workspace pricing & settings | • Registration *never* exposes Admin option (All signups default to Student) |

---

## 5. Product Modules & Screen Mappings

Every module corresponds to a pixel-perfect design template created in `stitch_designs/`:

### 5.1 Dashboard Module
* **UI Design Reference**: [stitch_designs/01_Dashboard_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/01_Dashboard_Spendly.html)
* **Summary Cards**: Current Month Total, Remaining Balance, Meals This Month, Daily Expenses, Total Payments, Missing Entries.
* **Quick Actions**: Record Meal, Add Expense, Add Payment.

### 5.2 Tiffin Module
* **UI Design Reference**: [stitch_designs/07_Tiffin_Tracking_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/07_Tiffin_Tracking_Spendly.html)
* **Features**:
  * Automatic today's date selection.
  * Lunch options: Half, Full, Skip.
  * Dinner options: Half, Full, Skip.
  * Missing Entries calendar modal to catch up on unrecorded past days in unlocked months.
  * Versioned workspace meal prices (Half Price, Full Price). Updates affect only future records.

### 5.3 Daily Expense Module
* **UI Design Reference**: [stitch_designs/04_Daily_Expenses_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/04_Daily_Expenses_Spendly.html)
* **Features**:
  * Fields: Category, Amount, Note, Date.
  * Default Categories: Food, Tea, Snacks, Grocery, Laundry, Travel, Medical, Shopping, Other.

### 5.4 Payments Module
* **UI Design Reference**: [stitch_designs/12_Payments_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/12_Payments_Spendly.html)
* **Features**:
  * Payment Types: Cash vs. UPI.
  * UPI includes screenshot upload, transaction note, date, and verification status (`Pending`, `Approved`, `Rejected`).
  * Approved payments immediately reduce the user's remaining balance.

### 5.5 Monthly Snapshot & Reports Module
* **UI Design References**: 
  * [stitch_designs/09_Monthly_History_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/09_Monthly_History_Spendly.html)
  * [stitch_designs/06_Reports_Analytics_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/06_Reports_Analytics_Spendly.html)
* **Features**:
  * Immutable snapshot generated at month-end containing totals, expenses, payments, remaining balance, and status.
  * Export options: Download PDF, Export CSV.

### 5.6 Admin Panel Module
* **UI Design Reference**: [stitch_designs/08_Admin_Dashboard_Spendly.html](file:///c:/Users/Taheer/Desktop/Spendly/stitch_designs/08_Admin_Dashboard_Spendly.html)
* **Features**: Student management, payment verification, meal price configuration, report exports, and month lock controls.

---

## 6. Business Rules

1. **Date Defaulting**: Today's date is selected by default across all forms.
2. **Month Locking**: Users can edit entries only in unlocked months. Once an Admin locks a month, records become read-only.
3. **Price Versioning**: Updating meal prices affects only future meal entries; historical records preserve the price active at the time of entry.
4. **Immediate Balance Settlement**: Approved payments immediately decrement the outstanding balance.
5. **Immutable Snapshots**: Closed months generate permanent snapshots that cannot be overwritten.

---

## 7. Success Criteria

The MVP is complete when a user can:
1. Register & login securely (default role: Student).
2. Join/select a workspace.
3. Record daily meals (Half/Full/Skip) in one click.
4. Log daily expenses with categories.
5. Upload UPI payment proof or record cash payments.
6. View real-time balance calculations & missing entry alerts.
7. Generate and download monthly PDF/CSV reports.
8. Browse immutable historical records.
9. Verify payments and manage residents via the Admin Panel.
