import { BookingApartment, CreateBookingRequest, UpdateBookingRequest, BookingFilters } from "../entities/booking.entity";

export interface BookingRepository {
    findAll(filters: BookingFilters): Promise<{ data: BookingApartment[], total: number }>;
    findById(id: number): Promise<BookingApartment | null>;
    create(booking: CreateBookingRequest): Promise<BookingApartment>;
    update(id: number, booking: UpdateBookingRequest): Promise<BookingApartment>;
    delete(id: number): Promise<boolean>;
    findByApartmentAndDateRange(apartamentoId: number, fechaCheckIn: string, fechaCheckOut: string): Promise<BookingApartment[]>;
    findByUserAndDateRange(usuarioId: number, fechaDesde?: string, fechaHasta?: string): Promise<BookingApartment[]>;
}