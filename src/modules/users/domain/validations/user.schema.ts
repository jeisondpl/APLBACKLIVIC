import { ApiError } from "@/app/lib/api-response";
import { z } from "zod";

export const CreateUserSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido y debe ser una cadena válida"),
  email: z.string()
    .email("Debe ser un email válido")
    .min(1, "El email es requerido"),
  edad: z.number()
    .int("La edad debe ser un número entero")
    .min(1, "La edad debe ser mayor a 0")
    .max(120, "La edad debe ser menor a 120"),
});

export const UpdateUserSchema = z.object({
  nombre: z.string().min(1, "El nombre debe ser una cadena válida").optional(),
  email: z.string().email("Debe ser un email válido").optional(),
  edad: z.number()
    .int("La edad debe ser un número entero")
    .min(1, "La edad debe ser mayor a 0")
    .max(120, "La edad debe ser menor a 120").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Al menos un campo debe ser proporcionado para actualizar" }
);

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

export function validateCreateUser(data: unknown): CreateUserRequest {
  const parsed = CreateUserSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateUpdateUser(data: unknown): UpdateUserRequest {
  const parsed = UpdateUserSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateUserEmail(
  email: string,
  existingUsers: { id: number; email: string }[],
  excludeId?: number
): void {
  const isDuplicate = existingUsers.some(
    user => user.email === email && user.id !== excludeId
  );

  if (isDuplicate) {
    throw new ApiError(`Ya existe un usuario con el email ${email}`, 409);
  }
}