import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const RoleSchema = z.enum(['STUDENT', 'ADMIN', 'SUPER_ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const MealOptionSchema = z.enum(['HALF', 'FULL', 'SKIP']);
export type MealOption = z.infer<typeof MealOptionSchema>;

export const PaymentTypeSchema = z.enum(['CASH', 'UPI']);
export type PaymentType = z.infer<typeof PaymentTypeSchema>;

export const PaymentStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const MonthStatusSchema = z.enum(['OPEN', 'CLOSED', 'PAID', 'PENDING']);
export type MonthStatus = z.infer<typeof MonthStatusSchema>;

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Meal Schemas ─────────────────────────────────────────────────────────────

export const RecordMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  lunch: MealOptionSchema,
  dinner: MealOptionSchema,
});
export type RecordMealInput = z.infer<typeof RecordMealSchema>;

// ─── Expense Schemas ──────────────────────────────────────────────────────────

export const CreateExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export const UpdateExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

// ─── Payment Schemas ──────────────────────────────────────────────────────────

export const SubmitPaymentSchema = z.object({
  type: PaymentTypeSchema,
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  screenshotPath: z.string().optional(),
});
export type SubmitPaymentInput = z.infer<typeof SubmitPaymentSchema>;

export const VerifyPaymentSchema = z.object({
  status: PaymentStatusSchema,
  verifiedBy: z.string().optional(),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

// ─── Admin Schemas ────────────────────────────────────────────────────────────

export const UpdateMealPricesSchema = z.object({
  halfPrice: z.number().nonnegative('Half price must be non-negative'),
  fullPrice: z.number().nonnegative('Full price must be non-negative'),
});
export type UpdateMealPricesInput = z.infer<typeof UpdateMealPricesSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: RoleSchema,
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export const MonthLockSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'),
  lock: z.boolean(),
});
export type MonthLockInput = z.infer<typeof MonthLockSchema>;

// ─── Profile Schemas ──────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  workspaceId?: string;
  workspaceName?: string;
}

export interface MealRecord {
  id: string;
  workspaceId: string;
  userId: string;
  date: string;
  lunch: MealOption;
  dinner: MealOption;
  lunchCost: number;
  dinnerCost: number;
  totalCost: number;
}

export interface ExpenseRecord {
  id: string;
  workspaceId: string;
  userId: string;
  category: string;
  amount: number;
  note?: string | null;
  date: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  workspaceId: string;
  userId: string;
  type: PaymentType;
  amount: number;
  screenshotPath?: string | null;
  note?: string | null;
  date: string;
  status: PaymentStatus;
  verifiedBy?: string | null;
  createdAt: string;
}

export interface MonthlySnapshotRecord {
  id: string;
  workspaceId: string;
  userId: string;
  month: string;
  mealTotal: number;
  expenseTotal: number;
  paymentTotal: number;
  balanceDue: number;
  status: MonthStatus;
  isLocked: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  currentMonthTotal: number;
  remainingBalance: number;
  mealsThisMonth: number;
  dailyExpenses: number;
  totalPayments: number;
  missingEntries: number;
}

export interface MonthlyReport {
  month: string;
  mealTotal: number;
  expenseTotal: number;
  paymentTotal: number;
  remainingBalance: number;
  categories: Array<{ name: string; amount: number; pct: string }>;
}
