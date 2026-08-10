import { z } from 'zod';
export declare const RoleSchema: z.ZodEnum<["STUDENT", "ADMIN", "SUPER_ADMIN"]>;
export type Role = z.infer<typeof RoleSchema>;
export declare const MealOptionSchema: z.ZodEnum<["HALF", "FULL", "SKIP"]>;
export type MealOption = z.infer<typeof MealOptionSchema>;
export declare const PaymentTypeSchema: z.ZodEnum<["CASH", "UPI"]>;
export type PaymentType = z.infer<typeof PaymentTypeSchema>;
export declare const PaymentStatusSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export declare const MonthStatusSchema: z.ZodEnum<["OPEN", "CLOSED", "PAID", "PENDING"]>;
export type MonthStatus = z.infer<typeof MonthStatusSchema>;
export declare const RegisterSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
    phone?: string | undefined;
}, {
    fullName: string;
    email: string;
    password: string;
    phone?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const RecordMealSchema: z.ZodObject<{
    date: z.ZodString;
    lunch: z.ZodEnum<["HALF", "FULL", "SKIP"]>;
    dinner: z.ZodEnum<["HALF", "FULL", "SKIP"]>;
}, "strip", z.ZodTypeAny, {
    date: string;
    lunch: "HALF" | "FULL" | "SKIP";
    dinner: "HALF" | "FULL" | "SKIP";
}, {
    date: string;
    lunch: "HALF" | "FULL" | "SKIP";
    dinner: "HALF" | "FULL" | "SKIP";
}>;
export type RecordMealInput = z.infer<typeof RecordMealSchema>;
export declare const CreateExpenseSchema: z.ZodObject<{
    category: z.ZodString;
    amount: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    category: string;
    amount: number;
    note?: string | undefined;
}, {
    date: string;
    category: string;
    amount: number;
    note?: string | undefined;
}>;
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export declare const UpdateExpenseSchema: z.ZodObject<{
    category: z.ZodString;
    amount: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    category: string;
    amount: number;
    note?: string | undefined;
}, {
    date: string;
    category: string;
    amount: number;
    note?: string | undefined;
}>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
export declare const SubmitPaymentSchema: z.ZodObject<{
    type: z.ZodEnum<["CASH", "UPI"]>;
    amount: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    screenshotPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CASH" | "UPI";
    date: string;
    amount: number;
    note?: string | undefined;
    screenshotPath?: string | undefined;
}, {
    type: "CASH" | "UPI";
    date: string;
    amount: number;
    note?: string | undefined;
    screenshotPath?: string | undefined;
}>;
export type SubmitPaymentInput = z.infer<typeof SubmitPaymentSchema>;
export declare const VerifyPaymentSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
    verifiedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED";
    verifiedBy?: string | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED";
    verifiedBy?: string | undefined;
}>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export declare const UpdateMealPricesSchema: z.ZodObject<{
    halfPrice: z.ZodNumber;
    fullPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    halfPrice: number;
    fullPrice: number;
}, {
    halfPrice: number;
    fullPrice: number;
}>;
export type UpdateMealPricesInput = z.infer<typeof UpdateMealPricesSchema>;
export declare const UpdateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["STUDENT", "ADMIN", "SUPER_ADMIN"]>;
}, "strip", z.ZodTypeAny, {
    role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
}, {
    role: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
}>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export declare const MonthLockSchema: z.ZodObject<{
    month: z.ZodString;
    lock: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    month: string;
    lock: boolean;
}, {
    month: string;
    lock: boolean;
}>;
export type MonthLockInput = z.infer<typeof MonthLockSchema>;
export declare const UpdateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    phone?: string | null | undefined;
    avatarUrl?: string | null | undefined;
}, {
    fullName?: string | undefined;
    phone?: string | null | undefined;
    avatarUrl?: string | null | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
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
    categories: Array<{
        name: string;
        amount: number;
        pct: string;
    }>;
}
//# sourceMappingURL=index.d.ts.map