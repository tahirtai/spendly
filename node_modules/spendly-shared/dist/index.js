"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMealPricesSchema = exports.SubmitPaymentSchema = exports.CreateExpenseSchema = exports.RecordMealSchema = exports.LoginSchema = exports.RegisterSchema = exports.MonthStatusSchema = exports.PaymentStatusSchema = exports.PaymentTypeSchema = exports.MealOptionSchema = exports.RoleSchema = void 0;
const zod_1 = require("zod");
exports.RoleSchema = zod_1.z.enum(['STUDENT', 'ADMIN', 'SUPER_ADMIN']);
exports.MealOptionSchema = zod_1.z.enum(['HALF', 'FULL', 'SKIP']);
exports.PaymentTypeSchema = zod_1.z.enum(['CASH', 'UPI']);
exports.PaymentStatusSchema = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']);
exports.MonthStatusSchema = zod_1.z.enum(['OPEN', 'CLOSED', 'PAID', 'PENDING']);
// Auth Validation Schemas
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().optional(),
    workspaceCode: zod_1.z.string().min(3, 'Workspace code required'),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Meal Validation Schema
exports.RecordMealSchema = zod_1.z.object({
    date: zod_1.z.string(), // YYYY-MM-DD
    lunch: exports.MealOptionSchema,
    dinner: exports.MealOptionSchema,
});
// Expense Validation Schema
exports.CreateExpenseSchema = zod_1.z.object({
    category: zod_1.z.string().min(1, 'Category is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    note: zod_1.z.string().optional(),
    date: zod_1.z.string(), // YYYY-MM-DD
});
// Payment Validation Schema
exports.SubmitPaymentSchema = zod_1.z.object({
    type: exports.PaymentTypeSchema,
    amount: zod_1.z.number().positive('Amount must be positive'),
    note: zod_1.z.string().optional(),
    date: zod_1.z.string(), // YYYY-MM-DD
    screenshotPath: zod_1.z.string().optional(),
});
// Price Update Schema
exports.UpdateMealPricesSchema = zod_1.z.object({
    halfPrice: zod_1.z.number().nonnegative(),
    fullPrice: zod_1.z.number().nonnegative(),
});
