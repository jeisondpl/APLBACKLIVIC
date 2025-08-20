import { z } from "zod";
import { BookingStatus } from "../entities/booking.entity";
import { ApiError } from "@/app/lib/api-response";

// Schema for creating a booking
export const CreateBookingSchema = z.object({
    apartamentoId: z.number().int().positive("El ID del apartamento debe ser un número positivo"),
    torreId: z.number().int().positive("El ID de la torre debe ser un número positivo"),
    usuarioId: z.number().int().positive("El ID del usuario debe ser un número positivo"),
    fechaCheckIn: z.string().datetime("La fecha de check-in debe ser una fecha válida").or(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de check-in debe tener formato YYYY-MM-DD")
    ),
    fechaCheckOut: z.string().datetime("La fecha de check-out debe ser una fecha válida").or(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de check-out debe tener formato YYYY-MM-DD")
    ),
    estado: z.nativeEnum(BookingStatus).optional().default(BookingStatus.PENDING),
    tarifaPorNoche: z.number().positive("La tarifa por noche debe ser un número positivo"),
    tarifaLimpieza: z.number().min(0, "La tarifa de limpieza debe ser un número no negativo"),
    observaciones: z.string().max(500, "Las observaciones no pueden superar 500 caracteres").optional()
}).refine((data) => {
    const checkIn = new Date(data.fechaCheckIn);
    const checkOut = new Date(data.fechaCheckOut);
    return checkOut > checkIn;
}, {
    message: "La fecha de check-out debe ser posterior a la fecha de check-in",
    path: ["fechaCheckOut"]
}).refine((data) => {
    const checkIn = new Date(data.fechaCheckIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn >= today;
}, {
    message: "La fecha de check-in no puede ser anterior a hoy",
    path: ["fechaCheckIn"]
});

// Schema for updating a booking
export const UpdateBookingSchema = z.object({
    apartamentoId: z.number().int().positive("El ID del apartamento debe ser un número positivo").optional(),
    torreId: z.number().int().positive("El ID de la torre debe ser un número positivo").optional(),
    usuarioId: z.number().int().positive("El ID del usuario debe ser un número positivo").optional(),
    fechaCheckIn: z.string().datetime("La fecha de check-in debe ser una fecha válida").or(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de check-in debe tener formato YYYY-MM-DD")
    ).optional(),
    fechaCheckOut: z.string().datetime("La fecha de check-out debe ser una fecha válida").or(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de check-out debe tener formato YYYY-MM-DD")
    ).optional(),
    estado: z.nativeEnum(BookingStatus).optional(),
    tarifaPorNoche: z.number().positive("La tarifa por noche debe ser un número positivo").optional(),
    tarifaLimpieza: z.number().min(0, "La tarifa de limpieza debe ser un número no negativo").optional(),
    observaciones: z.string().max(500, "Las observaciones no pueden superar 500 caracteres").optional()
}).refine((data) => {
    if (data.fechaCheckIn && data.fechaCheckOut) {
        const checkIn = new Date(data.fechaCheckIn);
        const checkOut = new Date(data.fechaCheckOut);
        return checkOut > checkIn;
    }
    return true;
}, {
    message: "La fecha de check-out debe ser posterior a la fecha de check-in",
    path: ["fechaCheckOut"]
});

// Schema for booking filters
export const BookingFiltersSchema = z.object({
    search: z.string().optional(),
    apartamentoId: z.number().int().positive().optional(),
    torreId: z.number().int().positive().optional(),
    usuarioId: z.number().int().positive().optional(),
    estado: z.nativeEnum(BookingStatus).optional(),
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    fechaCheckInDesde: z.string().optional(),
    fechaCheckInHasta: z.string().optional(),
    fechaCheckOutDesde: z.string().optional(),
    fechaCheckOutHasta: z.string().optional(),
    limit: z.number().int().positive().max(100).default(10),
    page: z.number().int().positive().default(1)
});

// Validation functions
export function validateCreateBooking(data: unknown) {
    const parsed = CreateBookingSchema.safeParse(data);
    if (!parsed.success) {
        const msg = parsed.error.issues.map(e => e.message).join(", ");
        throw new ApiError(`Errores de validación: ${msg}`, 400);
    }
    return parsed.data;
}

export function validateUpdateBooking(data: unknown) {
    const parsed = UpdateBookingSchema.safeParse(data);
    if (!parsed.success) {
        const msg = parsed.error.issues.map(e => e.message).join(", ");
        throw new ApiError(`Errores de validación: ${msg}`, 400);
    }
    return parsed.data;
}

export function validateBookingFilters(data: unknown) {
    const parsed = BookingFiltersSchema.safeParse(data);
    if (!parsed.success) {
        const msg = parsed.error.issues.map(e => e.message).join(", ");
        throw new ApiError(`Errores de validación en filtros: ${msg}`, 400);
    }
    return parsed.data;
}