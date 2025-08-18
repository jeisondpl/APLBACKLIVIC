import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { MemoryBookingRepository } from '@/modules/booking/infrastructure/MemoryBookingRepository';
import { GetBookingById } from '@/modules/booking/aplications/getBookingById';
import { UpdateBooking } from '@/modules/booking/aplications/updateBooking';
import { DeleteBooking } from '@/modules/booking/aplications/deleteBooking';
import { validateUpdateBooking } from '@/modules/booking/domain/validations/booking.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new MemoryBookingRepository();
        const useCase = new GetBookingById(repo);
        const booking = await useCase.execute(id);

        return createApiResponse(booking, "Reserva encontrada", 200);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const body = await req.json();
        const validatedData = validateUpdateBooking(body);

        const repo = new MemoryBookingRepository();
        const useCase = new UpdateBooking(repo);
        const updatedBooking = await useCase.execute(id, validatedData);

        return createApiResponse(updatedBooking, "Reserva actualizada exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new MemoryBookingRepository();
        const useCase = new DeleteBooking(repo);
        const result = await useCase.execute(id);

        return createApiResponse(result, "Reserva eliminada exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}