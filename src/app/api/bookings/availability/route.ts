import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { MemoryBookingRepository } from '@/modules/booking/infrastructure/MemoryBookingRepository';
import { CheckAvailability } from '@/modules/booking/aplications/checkAvailability';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const apartamentoId = parseInt(searchParams.get("apartamentoId") || "0");
        const fechaCheckIn = searchParams.get("fechaCheckIn");
        const fechaCheckOut = searchParams.get("fechaCheckOut");

        if (!apartamentoId || !fechaCheckIn || !fechaCheckOut) {
            return createApiResponse(null, "Parámetros requeridos: apartamentoId, fechaCheckIn, fechaCheckOut", 400);
        }

        if (isNaN(apartamentoId) || apartamentoId <= 0) {
            return createApiResponse(null, "apartamentoId debe ser un número válido", 400);
        }

        // Validate date format
        const checkInDate = new Date(fechaCheckIn);
        const checkOutDate = new Date(fechaCheckOut);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return createApiResponse(null, "Formato de fecha inválido. Use YYYY-MM-DD", 400);
        }

        if (checkOutDate <= checkInDate) {
            return createApiResponse(null, "La fecha de check-out debe ser posterior a la fecha de check-in", 400);
        }

        const repo = new MemoryBookingRepository();
        const useCase = new CheckAvailability(repo);
        const result = await useCase.execute(apartamentoId, fechaCheckIn, fechaCheckOut);

        return createApiResponse(result, result.available ? "Apartamento disponible" : "Apartamento no disponible", 200);
    } catch (error) {
        return handleApiError(error);
    }
}