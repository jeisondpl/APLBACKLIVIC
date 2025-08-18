import { BookingRepository } from "../domain/models/BookingRepository";
import { BookingFilters } from "../domain/entities/booking.entity";

export class GetBookings {
    constructor(private bookingRepository: BookingRepository) {}

    async execute(filters: BookingFilters) {
        return await this.bookingRepository.findAll(filters);
    }
}