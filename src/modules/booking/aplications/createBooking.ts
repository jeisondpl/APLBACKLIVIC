import { BookingRepository } from "../domain/models/BookingRepository";
import { CreateBookingRequest } from "../domain/entities/booking.entity";
import { ApiError } from "@/app/lib/api-response";

export class CreateBooking {
    constructor(private bookingRepository: BookingRepository) {}

    async execute(bookingData: CreateBookingRequest) {
        // Check for date conflicts with existing bookings
        const conflicts = await this.bookingRepository.findByApartmentAndDateRange(
            bookingData.apartamentoId,
            bookingData.fechaCheckIn,
            bookingData.fechaCheckOut
        );

        if (conflicts.length > 0) {
            throw new ApiError(
                `El apartamento no está disponible en las fechas seleccionadas. Existe una reserva conflictiva.`,
                409
            );
        }

        // Validate that check-in is not in the past
        const checkInDate = new Date(bookingData.fechaCheckIn);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            throw new ApiError("La fecha de check-in no puede ser anterior a hoy", 400);
        }

        // Validate that check-out is after check-in
        const checkOutDate = new Date(bookingData.fechaCheckOut);
        if (checkOutDate <= checkInDate) {
            throw new ApiError("La fecha de check-out debe ser posterior a la fecha de check-in", 400);
        }

        return await this.bookingRepository.create(bookingData);
    }
}