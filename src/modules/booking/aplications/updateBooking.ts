import { BookingRepository } from "../domain/models/BookingRepository";
import { UpdateBookingRequest } from "../domain/entities/booking.entity";
import { ApiError } from "@/app/lib/api-response";

export class UpdateBooking {
    constructor(private bookingRepository: BookingRepository) {}

    async execute(id: number, bookingData: UpdateBookingRequest) {
        // Check if booking exists
        const existingBooking = await this.bookingRepository.findById(id);
        if (!existingBooking) {
            throw new ApiError(`Reserva con ID ${id} no encontrada`, 404);
        }

        // If dates are being updated, check for conflicts
        if (bookingData.fechaCheckIn || bookingData.fechaCheckOut || bookingData.apartamentoId) {
            const checkInDate = bookingData.fechaCheckIn || existingBooking.fechaCheckIn;
            const checkOutDate = bookingData.fechaCheckOut || existingBooking.fechaCheckOut;
            const apartamentoId = bookingData.apartamentoId || existingBooking.apartamentoId;

            // Validate dates
            if (new Date(checkOutDate) <= new Date(checkInDate)) {
                throw new ApiError("La fecha de check-out debe ser posterior a la fecha de check-in", 400);
            }

            // Check for conflicts with other bookings (excluding current booking)
            const conflicts = await this.bookingRepository.findByApartmentAndDateRange(
                apartamentoId,
                checkInDate,
                checkOutDate
            );

            const hasConflicts = conflicts.some(conflict => conflict.id !== id);
            if (hasConflicts) {
                throw new ApiError(
                    `El apartamento no está disponible en las fechas seleccionadas. Existe una reserva conflictiva.`,
                    409
                );
            }
        }

        return await this.bookingRepository.update(id, bookingData);
    }
}