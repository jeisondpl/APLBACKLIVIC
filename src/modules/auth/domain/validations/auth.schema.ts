import { z } from "zod";
import { ApiError } from '@/app/lib/api-response';

// Schema definitions
export const LoginSchema = z.object({
  email: z.string()
    .min(1, "Email es requerido")
    .email("Formato de email inválido"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
});

export const RegisterSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  email: z.string()
    .min(1, "Email es requerido")
    .email("Formato de email inválido"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
  role: z.enum(["admin", "user", "manager"]).optional().default("user"),
  edad: z.number()
    .min(18, "La edad mínima es 18 años")
    .max(120, "Edad inválida")
    .optional()
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Contraseña actual es requerida"),
  newPassword: z.string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número")
});

export const ResetPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email es requerido")
    .email("Formato de email inválido")
});

// Type exports
export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;

// Validation helper functions
export function validateLogin(data: unknown): LoginRequest {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateRegister(data: unknown): RegisterRequest {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateChangePassword(data: unknown): ChangePasswordRequest {
  const parsed = ChangePasswordSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateResetPassword(data: unknown): ResetPasswordRequest {
  const parsed = ResetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}