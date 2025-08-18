import { BookingRepository } from "../domain/models/BookingRepository";
import { ApiError } from "@/app/lib/api-response";

export class GetBookingById {
    constructor(private bookingRepository: BookingRepository) {}

    async execute(id: number) {
        const booking = await this.bookingRepository.findById(id);
        
        if (!booking) {
            throw new ApiError(`Reserva con ID ${id} no encontrada`, 404);
        }
        
        return booking;
    }
}