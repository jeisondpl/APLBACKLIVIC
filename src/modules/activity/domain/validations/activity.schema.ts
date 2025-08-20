import { z } from "zod";
import { ActivityStatus } from "../entities/activity.entity";

const activityStatusSchema = z.nativeEnum(ActivityStatus, {
    errorMap: () => ({ message: "Estado de actividad inválido" })
});

export const createActivitySchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    tipoId: z.number()
        .int("El ID del tipo debe ser un número entero")
        .positive("El ID del tipo debe ser positivo"),
    descripcion: z.string()
        .min(1, "La descripción es requerida")
        .max(500, "La descripción no puede exceder 500 caracteres"),
    apartamentoId: z.number()
        .int("El ID del apartamento debe ser un número entero")
        .positive("El ID del apartamento debe ser positivo")
        .optional(),
    torreId: z.number()
        .int("El ID de la torre debe ser un número entero")
        .positive("El ID de la torre debe ser positivo")
        .optional(),
    usuarioAsignadoId: z.number()
        .int("El ID del usuario debe ser un número entero")
        .positive("El ID del usuario debe ser positivo")
        .optional(),
    estado: activityStatusSchema.default(ActivityStatus.PENDIENTE),
    fechaProgramada: z.string()
        .datetime("Formato de fecha inválido")
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"))
        .optional(),
    fechaCompletada: z.string()
        .datetime("Formato de fecha inválido")
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"))
        .optional(),
    observaciones: z.string()
        .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
        .optional()
}).refine((data) => {
    if (data.fechaProgramada && data.fechaCompletada) {
        return new Date(data.fechaProgramada) <= new Date(data.fechaCompletada);
    }
    return true;
}, {
    message: "La fecha programada debe ser anterior o igual a la fecha de completado",
    path: ["fechaCompletada"]
});

export const updateActivitySchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .optional(),
    tipoId: z.number()
        .int("El ID del tipo debe ser un número entero")
        .positive("El ID del tipo debe ser positivo")
        .optional(),
    descripcion: z.string()
        .min(1, "La descripción es requerida")
        .max(500, "La descripción no puede exceder 500 caracteres")
        .optional(),
    apartamentoId: z.number()
        .int("El ID del apartamento debe ser un número entero")
        .positive("El ID del apartamento debe ser positivo")
        .optional(),
    torreId: z.number()
        .int("El ID de la torre debe ser un número entero")
        .positive("El ID de la torre debe ser positivo")
        .optional(),
    usuarioAsignadoId: z.number()
        .int("El ID del usuario debe ser un número entero")
        .positive("El ID del usuario debe ser positivo")
        .optional(),
    estado: activityStatusSchema.optional(),
    fechaProgramada: z.string()
        .datetime("Formato de fecha inválido")
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"))
        .optional(),
    fechaCompletada: z.string()
        .datetime("Formato de fecha inválido")
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"))
        .optional(),
    observaciones: z.string()
        .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
        .optional()
}).refine((data) => {
    if (data.fechaProgramada && data.fechaCompletada) {
        return new Date(data.fechaProgramada) <= new Date(data.fechaCompletada);
    }
    return true;
}, {
    message: "La fecha programada debe ser anterior o igual a la fecha de completado",
    path: ["fechaCompletada"]
});

export const validateCreateActivity = (data: unknown) => {
    return createActivitySchema.parse(data);
};

export const validateUpdateActivity = (data: unknown) => {
    return updateActivitySchema.parse(data);
};


export const validateActivityStatus = (estado: string) => {
    return activityStatusSchema.parse(estado);
};