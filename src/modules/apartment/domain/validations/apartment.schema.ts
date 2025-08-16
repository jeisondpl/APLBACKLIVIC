// src/modules/apartments/validations/apartment.schema.ts
import { ApiError } from "@/app/lib/api-response";
import { z } from "zod";

// ✅ Schema para crear un apartamento
export const CreateApartmentSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido y debe ser una cadena válida"),
  numero: z.string()
    .min(1, "El número es requerido y debe ser una cadena válida"),
  descripcion: z.string()
    .min(1, "La descripción es requerida y debe ser una cadena válida"),
});

// ✅ Schema para actualizar (todos opcionales)
export const UpdateApartmentSchema = z.object({
  nombre: z.string().min(1, "El nombre debe ser una cadena válida").optional(),
  numero: z.string().min(1, "El número debe ser una cadena válida").optional(),
  descripcion: z.string().min(1, "La descripción debe ser una cadena válida").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Al menos un campo debe ser proporcionado para actualizar" }
);

// ✅ Tipos derivados automáticamente
export type CreateApartmentRequest = z.infer<typeof CreateApartmentSchema>;
export type UpdateApartmentRequest = z.infer<typeof UpdateApartmentSchema>;

// ✅ Funciones helpers que lanzan ApiError si falla
export function validateCreateApartment(data: unknown): CreateApartmentRequest {
  const parsed = CreateApartmentSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateUpdateApartment(data: unknown): UpdateApartmentRequest {
  const parsed = UpdateApartmentSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

// ✅ Validación de duplicados
export function validateApartmentNumber(
  numero: string,
  existingApartments: { id: number; numero: string }[],
  excludeId?: number
): void {
  const isDuplicate = existingApartments.some(
    apt => apt.numero === numero && apt.id !== excludeId
  );

  if (isDuplicate) {
    throw new ApiError(`Ya existe un apartamento con el número ${numero}`, 409);
  }
}