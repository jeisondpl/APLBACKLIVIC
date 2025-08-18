import { BookingRepository } from "../domain/models/BookingRepository";

export class CheckAvailability {
    constructor(private bookingRepository: BookingRepository) {}

    async execute(apartamentoId: number, fechaCheckIn: string, fechaCheckOut: string) {
        const conflicts = await this.bookingRepository.findByApartmentAndDateRange(
            apartamentoId,
            fechaCheckIn,
            fechaCheckOut
        );

        return {
            available: conflicts.length === 0,
            conflictingBookings: conflicts,
            apartamentoId,
            fechaCheckIn,
            fechaCheckOut
        };
    }
}