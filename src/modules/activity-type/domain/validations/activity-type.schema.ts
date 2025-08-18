import { z } from "zod";

export const createActivityTypeSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    descripcion: z.string()
        .min(1, "La descripción es requerida")
        .max(500, "La descripción no puede exceder 500 caracteres"),
    activo: z.boolean()
        .default(true)
});

export const updateActivityTypeSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .optional(),
    descripcion: z.string()
        .min(1, "La descripción es requerida")
        .max(500, "La descripción no puede exceder 500 caracteres")
        .optional(),
    activo: z.boolean()
        .optional()
});

export const validateCreateActivityType = (data: unknown) => {
    return createActivityTypeSchema.parse(data);
};

export const validateUpdateActivityType = (data: unknown) => {
    return updateActivityTypeSchema.parse(data);
};