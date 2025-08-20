export enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed", 
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}

export interface BookingApartment {
    id: number;
    apartamentoId: number;
    torreId: number;
    usuarioId: number;
    fechaCheckIn: string;
    fechaCheckOut: string;
    estado: BookingStatus;
    noches: number;
    tarifaPorNoche: number;
    tarifaLimpieza: number;
    observaciones?: string;
    createdAt: string;
    updatedAt: string;
    // Relations
    apartamento?: {
        id: number;
        nombre: string;
        numero: string;
    };
    torre?: {
        id: number;
        nombre: string;
    };
    usuario?: {
        id: number;
        nombre: string;
        email: string;
    };
}

export interface CreateBookingRequest {
    apartamentoId: number;
    torreId: number;
    usuarioId: number;
    fechaCheckIn: string;
    fechaCheckOut: string;
    estado?: BookingStatus;
    tarifaPorNoche: number;
    tarifaLimpieza: number;
    observaciones?: string;
}

export interface CreateBookingWithActivityRequest extends CreateBookingRequest {
    createActivity?: boolean;
    activityData?: {
        nombre: string;
        tipoId: number;
        descripcion: string;
        usuarioAsignadoId?: number;
        prioridad?: string;
        fechaProgramada?: string;
        notas?: string;
    };
}

export interface UpdateBookingRequest {
    apartamentoId?: number;
    torreId?: number;
    usuarioId?: number;
    fechaCheckIn?: string;
    fechaCheckOut?: string;
    estado?: BookingStatus;
    tarifaPorNoche?: number;
    tarifaLimpieza?: number;
    observaciones?: string;
}

export interface BookingFilters {
    search?: string;
    apartamentoId?: number;
    torreId?: number;
    usuarioId?: number;
    estado?: BookingStatus;
    fechaDesde?: string;
    fechaHasta?: string;
    fechaCheckInDesde?: string;
    fechaCheckInHasta?: string;
    fechaCheckOutDesde?: string;
    fechaCheckOutHasta?: string;
    limit?: number;
    page?: number;
}

// Helper functions for status handling
export function getBookingStatusLabel(status: BookingStatus): string {
    switch (status) {
        case BookingStatus.PENDING:
            return 'Pendiente';
        case BookingStatus.CONFIRMED:
            return 'Confirmada';
        case BookingStatus.CANCELLED:
            return 'Cancelada';
        case BookingStatus.COMPLETED:
            return 'Completada';
        default:
            return 'Desconocido';
    }
}

export function getBookingStatusColor(status: BookingStatus): {
    bg: string;
    text: string;
    dot: string;
} {
    switch (status) {
        case BookingStatus.PENDING:
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                dot: 'bg-yellow-400'
            };
        case BookingStatus.CONFIRMED:
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                dot: 'bg-green-400'
            };
        case BookingStatus.CANCELLED:
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                dot: 'bg-red-400'
            };
        case BookingStatus.COMPLETED:
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                dot: 'bg-blue-400'
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                dot: 'bg-gray-400'
            };
    }
}

// Helper function to calculate nights
export function calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}