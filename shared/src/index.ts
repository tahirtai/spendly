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
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchem