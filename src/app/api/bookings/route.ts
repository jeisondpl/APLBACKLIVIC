import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { MemoryBookingRepository } from '@/modules/booking/infrastructure/MemoryBookingRepository';
import { GetBookings } from '@/modules/booking/aplications/getBookings';
import { CreateBooking } from '@/modules/booking/aplications/createBooking';
import { validateCreateBooking } from '@/modules/booking/domain/validations/booking.schema';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            apartamentoId: searchParams.get("apartamentoId") ? parseInt(searchParams.get("apartamentoId")!) : undefined,
            torreId: searchParams.get("torreId") ? parseInt(searchParams.get("torreId")!) : undefined,
            usuarioId: searchParams.get("usuarioId") ? parseInt(searchParams.get("usuarioId")!) : undefined,
            estado: searchParams.get("estado") || undefined,
            fechaDesde: searchParams.get("fechaDesde") || undefined,
            fechaHasta: searchParams.get("fechaHasta") || undefined,
            fechaCheckInDesde: searchParams.get("fechaCheckInDesde") || undefined,
            fechaCheckInHasta: searchParams.get("fechaCheckInHasta") || undefined,
            fechaCheckOutDesde: searchParams.get("fechaCheckOutDesde") || undefined,
            fechaCheckOutHasta: searchParams.get("fechaCheckOutHasta") || undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new MemoryBookingRepository();
        const useCase = new GetBookings(repo);
        const result = await useCase.execute(filters);

        return createApiResponse(result.data, `Total: ${result.total}`, 200, {
            total: result.total,
            page: filters.page,
            limit: filters.limit,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = validateCreateBooking(body);

        const repo = new MemoryBookingRepository();
        const useCase = new CreateBooking(repo);
        const newBooking = await useCase.execute(validatedData);

        return createApiResponse(newBooking, "Reserva creada exitosamente", 201);
    } catch (error) {
        return handleApiError(error);
    }
}