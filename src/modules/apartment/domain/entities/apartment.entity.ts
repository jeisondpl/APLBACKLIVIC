// types/apartment.ts
export interface Apartment {
    id: number;
    nombre: string;
    numero: string;
    descripcion: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApartmentRequest {
    nombre: string;
    numero: string;
    descripcion: string;
}

export interface UpdateApartmentRequest {
    nombre?: string;
    numero?: string;
    descripcion?: string;
}

export interface ApartmentFilters {
    search?: string;
    numero?: string;
    limit?: number;
    page?: number;
}