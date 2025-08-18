import { BookingRepository } from "../domain/models/BookingRepository";
import { ApiError } from "@/app/lib/api-response";

export class DeleteBooking {
    constructor(private bookingRepository: BookingRepository) {}

    async execute(id: number) {
        const booking = await this.bookingRepository.findById(id);
        
        if (!booking) {
            throw new ApiError(`Reserva con ID ${id} no encontrada`, 404);
        }

        const deleted = await this.bookingRepository.delete(id);
        
        if (!deleted) {
            throw new ApiError(`No se pudo eliminar la reserva con ID ${id}`, 500);
        }
        
        return { success: true, message: "Reserva eliminada exitosamente" };
    }
}