import { BookingRepository } from "../domain/models/BookingRepository";
import { BookingApartment, CreateBookingRequest, UpdateBookingRequest, BookingFilters, BookingStatus, calculateNights } from "../domain/entities/booking.entity";

export class MemoryBookingRepository implements BookingRepository {
    private bookings: BookingApartment[] = [
        {
            id: 1,
            apartamentoId: 1,
            torreId: 1,
            usuarioId: 1,
            fechaCheckIn: "2024-03-15",
            fechaCheckOut: "2024-03-20",
            estado: BookingStatus.CONFIRMED,
            noches: 5,
            observaciones: "Reserva familiar para vacaciones de semana santa",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z"
        },
        {
            id: 2,
            apartamentoId: 2,
            torreId: 1,
            usuarioId: 2,
            fechaCheckIn: "2024-03-22",
            fechaCheckOut: "2024-03-25",
            estado: BookingStatus.PENDING,
            noches: 3,
            observaciones: "Viaje de negocios",
            createdAt: "2024-01-16T14:30:00.000Z",
            updatedAt: "2024-01-16T14:30:00.000Z"
        },
        {
            id: 3,
            apartamentoId: 3,
            torreId: 2,
            usuarioId: 3,
            fechaCheckIn: "2024-04-01",
            fechaCheckOut: "2024-04-10",
            estado: BookingStatus.CONFIRMED,
            noches: 9,
            observaciones: "Reserva de penthouse para luna de miel",
            createdAt: "2024-01-17T09:15:00.000Z",
            updatedAt: "2024-01-17T09:15:00.000Z"
        },
        {
            id: 4,
            apartamentoId: 1,
            torreId: 1,
            usuarioId: 2,
            fechaCheckIn: "2024-04-15",
            fechaCheckOut: "2024-04-18",
            estado: BookingStatus.PENDING,
            noches: 3,
            observaciones: "Fin de semana largo",
            createdAt: "2024-01-18T16:45:00.000Z",
            updatedAt: "2024-01-18T16:45:00.000Z"
        },
        {
            id: 5,
            apartamentoId: 2,
            torreId: 1,
            usuarioId: 1,
            fechaCheckIn: "2024-05-01",
            fechaCheckOut: "2024-05-05",
            estado: BookingStatus.CANCELLED,
            noches: 4,
            observaciones: "Cancelada por cambio de planes",
            createdAt: "2024-01-19T11:20:00.000Z",
            updatedAt: "2024-01-20T08:30:00.000Z"
        }
    ];
    private nextId = 6;

    async findAll(filters: BookingFilters): Promise<{ data: BookingApartment[], total: number }> {
        let filtered = [...this.bookings];

        // Apply filters
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(booking => 
                booking.observaciones?.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.apartamentoId) {
            filtered = filtered.filter(booking => booking.apartamentoId === filters.apartamentoId);
        }

        if (filters.torreId) {
            filtered = filtered.filter(booking => booking.torreId === filters.torreId);
        }

        if (filters.usuarioId) {
            filtered = filtered.filter(booking => booking.usuarioId === filters.usuarioId);
        }

        if (filters.estado) {
            filtered = filtered.filter(booking => booking.estado === filters.estado);
        }

        if (filters.fechaCheckInDesde) {
            filtered = filtered.filter(booking => 
                new Date(booking.fechaCheckIn) >= new Date(filters.fechaCheckInDesde!)
            );
        }

        if (filters.fechaCheckInHasta) {
            filtered = filtered.filter(booking => 
                new Date(booking.fechaCheckIn) <= new Date(filters.fechaCheckInHasta!)
            );
        }

        if (filters.fechaCheckOutDesde) {
            filtered = filtered.filter(booking => 
                new Date(booking.fechaCheckOut) >= new Date(filters.fechaCheckOutDesde!)
            );
        }

        if (filters.fechaCheckOutHasta) {
            filtered = filtered.filter(booking => 
                new Date(booking.fechaCheckOut) <= new Date(filters.fechaCheckOutHasta!)
            );
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = filtered.length;
        const limit = filters.limit || 10;
        const page = filters.page || 1;
        const offset = (page - 1) * limit;

        const paginatedData = filtered.slice(offset, offset + limit);

        return { data: paginatedData, total };
    }

    async findById(id: number): Promise<BookingApartment | null> {
        const booking = this.bookings.find(b => b.id === id);
        return booking || null;
    }

    async create(bookingData: CreateBookingRequest): Promise<BookingApartment> {
        const noches = calculateNights(bookingData.fechaCheckIn, bookingData.fechaCheckOut);
        
        const newBooking: BookingApartment = {
            id: this.nextId++,
            apartamentoId: bookingData.apartamentoId,
            torreId: bookingData.torreId,
            usuarioId: bookingData.usuarioId,
            fechaCheckIn: bookingData.fechaCheckIn,
            fechaCheckOut: bookingData.fechaCheckOut,
            estado: bookingData.estado || BookingStatus.PENDING,
            noches,
            observaciones: bookingData.observaciones,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.bookings.push(newBooking);
        return newBooking;
    }

    async update(id: number, bookingData: UpdateBookingRequest): Promise<BookingApartment> {
        const index = this.bookings.findIndex(b => b.id === id);
        if (index === -1) {
            throw new Error(`Booking with id ${id} not found`);
        }

        const existingBooking = this.bookings[index];
        
        // Calculate new nights if dates are updated
        let noches = existingBooking.noches;
        const newCheckIn = bookingData.fechaCheckIn || existingBooking.fechaCheckIn;
        const newCheckOut = bookingData.fechaCheckOut || existingBooking.fechaCheckOut;
        
        if (bookingData.fechaCheckIn || bookingData.fechaCheckOut) {
            noches = calculateNights(newCheckIn, newCheckOut);
        }

        const updatedBooking: BookingApartment = {
            ...existingBooking,
            ...bookingData,
            noches,
            updatedAt: new Date().toISOString()
        };

        this.bookings[index] = updatedBooking;
        return updatedBooking;
    }

    async delete(id: number): Promise<boolean> {
        const index = this.bookings.findIndex(b => b.id === id);
        if (index === -1) {
            return false;
        }

        this.bookings.splice(index, 1);
        return true;
    }

    async findByApartmentAndDateRange(apartamentoId: number, fechaCheckIn: string, fechaCheckOut: string): Promise<BookingApartment[]> {
        const checkIn = new Date(fechaCheckIn);
        const checkOut = new Date(fechaCheckOut);

        return this.bookings.filter(booking => {
            if (booking.apartamentoId !== apartamentoId) return false;
            if (booking.estado === BookingStatus.CANCELLED) return false;

            const bookingCheckIn = new Date(booking.fechaCheckIn);
            const bookingCheckOut = new Date(booking.fechaCheckOut);

            // Check for date overlap
            return !(checkOut <= bookingCheckIn || checkIn >= bookingCheckOut);
        });
    }

    async findByUserAndDateRange(usuarioId: number, fechaDesde?: string, fechaHasta?: string): Promise<BookingApartment[]> {
        let filtered = this.bookings.filter(booking => booking.usuarioId === usuarioId);

        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            filtered = filtered.filter(booking => 
                new Date(booking.fechaCheckIn) >= desde
            );
        }

        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            filtered = filtered.filter(booking => 
                new Date(booking.fechaCheckOut) <= hasta
            );
        }

        return filtered.sort((a, b) => new Date(a.fechaCheckIn).getTime() - new Date(b.fechaCheckIn).getTime());
    }
}