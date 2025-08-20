import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresBookingRepository } from '@/modules/booking/infrastructure/PostgresBookingRepository';
import { MemoryBookingRepository } from '@/modules/booking/infrastructure/MemoryBookingRepository';
import { PostgresActivityRepository } from '@/modules/activity/infrastructure/ActivityRepository';
import { MemoryActivityRepository } from '@/modules/activity/infrastructure/MemoryActivityRepository';
import { GetBookings } from '@/modules/booking/aplications/getBookings';
import { CreateBooking } from '@/modules/booking/aplications/createBooking';
import { CreateBookingWithActivity } from '@/modules/booking/aplications/createBookingWithActivity';
import { validateCreateBooking } from '@/modules/booking/domain/validations/booking.schema';
import { BookingStatus } from '@/modules/booking/domain/entities/booking.entity';

function getBookingRepository() {
    const usePostgres = process.env.USE_POSTGRES === 'true';
    return usePostgres ? new PostgresBookingRepository() : new MemoryBookingRepository();
}

function getActivityRepository() {
    const usePostgres = process.env.USE_POSTGRES === 'true';
    return usePostgres ? new PostgresActivityRepository() : new MemoryActivityRepository();
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const estadoParam = searchParams.get("estado");
        const filters = {
            search: searchParams.get("search") || undefined,
            apartamentoId: searchParams.get("apartamentoId") ? parseInt(searchParams.get("apartamentoId")!) : undefined,
            torreId: searchParams.get("torreId") ? parseInt(searchParams.get("torreId")!) : undefined,
            usuarioId: searchParams.get("usuarioId") ? parseInt(searchParams.get("usuarioId")!) : undefined,
            estado: estadoParam && Object.values(BookingStatus).includes(estadoParam as BookingStatus) 
                ? estadoParam as BookingStatus 
                : undefined,
            fechaDesde: searchParams.get("fechaDesde") || undefined,
            fechaHasta: searchParams.get("fechaHasta") || undefined,
            fechaCheckInDesde: searchParams.get("fechaCheckInDesde") || undefined,
            fechaCheckInHasta: searchParams.get("fechaCheckInHasta") || undefined,
            fechaCheckOutDesde: searchParams.get("fechaCheckOutDesde") || undefined,
            fechaCheckOutHasta: searchParams.get("fechaCheckOutHasta") || undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = getBookingRepository();
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
        
        // Check if we need to create an activity with the booking
        if (body.createActivity && body.activityData) {
            const bookingRepo = getBookingRepository();
            const activityRepo = getActivityRepository();
            const useCase = new CreateBookingWithActivity(bookingRepo, activityRepo);
            
            const result = await useCase.execute(body);
            
            return createApiResponse(result, "Reserva y actividad creadas exitosamente", 201);
        } else {
            // Standard booking creation
            const validatedData = validateCreateBooking(body);
            const repo = getBookingRepository();
            const useCase = new CreateBooking(repo);
            const newBooking = await useCase.execute(validatedData);

            return createApiResponse(newBooking, "Reserva creada exitosamente", 201);
        }
    } catch (error) {
        return handleApiError(error);
    }
}