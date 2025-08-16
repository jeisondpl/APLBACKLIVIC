import { ApiError } from "@/app/lib/api-response";
import { z } from "zod";

export const CreateTowerSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido y debe ser una cadena válida"),
  numero: z.string()
    .min(1, "El número es requerido y debe ser una cadena válida"),
  descripcion: z.string()
    .min(1, "La descripción es requerida y debe ser una cadena válida"),
  direccion: z.string()
    .min(1, "La dirección es requerida y debe ser una cadena válida"),
  pisos: z.number()
    .int("El número de pisos debe ser un entero")
    .min(1, "El número de pisos debe ser mayor a 0"),
  apartamentosPorPiso: z.number()
    .int("Los apartamentos por piso debe ser un entero")
    .min(1, "Los apartamentos por piso debe ser mayor a 0"),
});

export const UpdateTowerSchema = z.object({
  nombre: z.string().min(1, "El nombre debe ser una cadena válida").optional(),
  numero: z.string().min(1, "El número debe ser una cadena válida").optional(),
  descripcion: z.string().min(1, "La descripción debe ser una cadena válida").optional(),
  direccion: z.string().min(1, "La dirección debe ser una cadena válida").optional(),
  pisos: z.number()
    .int("El número de pisos debe ser un entero")
    .min(1, "El número de pisos debe ser mayor a 0").optional(),
  apartamentosPorPiso: z.number()
    .int("Los apartamentos por piso debe ser un entero")
    .min(1, "Los apartamentos por piso debe ser mayor a 0").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Al menos un campo debe ser proporcionado para actualizar" }
);

export type CreateTowerRequest = z.infer<typeof CreateTowerSchema>;
export type UpdateTowerRequest = z.infer<typeof UpdateTowerSchema>;

export function validateCreateTower(data: unknown): CreateTowerRequest {
  const parsed = CreateTowerSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateUpdateTower(data: unknown): UpdateTowerRequest {
  const parsed = UpdateTowerSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(e => e.message).join(", ");
    throw new ApiError(`Errores de validación: ${msg}`, 400);
  }
  return parsed.data;
}

export function validateTowerNumber(
  numero: string,
  existingTowers: { id: number; numero: string }[],
  excludeId?: number
): void {
  const isDuplicate = existingTowers.some(
    tower => tower.numero === numero && tower.id !== excludeId
  );

  if (isDuplicate) {
    throw new ApiError(`Ya existe una torre con el número ${numero}`, 409);
  }
}