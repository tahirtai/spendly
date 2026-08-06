import { z } from 'zod';
// ─── Enums ────────────────────────────────────────────────────────────────────
export const RoleSchema = z.enum(['STUDENT', 'ADMIN', 'SUPER_ADMIN']);
export const MealOptionSchema = z.enum(['HALF', 'FULL', 'SKIP']);
export const PaymentTypeSchema = z.enum(['CASH', 'UPI']);
export const PaymentStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const MonthStatusSchema = z.enum(['OPEN', 'CLOSED', 'PAID', 'PENDING']);
// ─── Auth Schemas ─────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
});
export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
// ─── Meal Schemas ─────────────────────────────────────────────────────────────
export const RecordMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    lunch: MealOptionSchema,
    dinner: MealOptionSchema,
});
// ─── Expense Schemas ──────────────────────────────────────────────────────────
export const CreateExpenseSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});
export const UpdateExpenseSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});
// ─── Payment Schemas ──────────────────────────────────────────────────────────
export const SubmitPaymentSchema = z.object({
    type: PaymentTypeSchema,
    amount: z.number().positive('Amount must be positive'),
    note: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    screenshotPath: z.string().optional(),
});
export const VerifyPaymentSchema = z.object({
    status: PaymentStatusSchema,
    verifiedBy: z.string().optional(),
});
// ─── Admin Schemas ────────────────────────────────────────────────────────────
export const UpdateMealPricesSchema = z.object({
    halfPrice: z.number().nonnegative('Half price must be non-negative'),
    fullPrice: z.number().nonnegative('Full price must be non-negative'),
});
export const UpdateMemberRoleSchema = z.object({
    role: RoleSchema,
});
export const MonthLockSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format'),
    lock: z.boolean(),
});
// ─── Profile Schemas ──────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().url('Invalid URL').optional(),
});
