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
    workspaceCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
    workspaceCode: string;
    phone?: string | undefined;
}, {
    fullName: string;
    email: string;
    password: string;
    workspaceCode: string;
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
