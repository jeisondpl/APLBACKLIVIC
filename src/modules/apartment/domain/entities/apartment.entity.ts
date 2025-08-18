// types/apartment.ts
export interface Tower {
    id: number;
    nombre: string;
}

export interface Apartment {
    id: number;
    nombre: string;
    numero: string;
    descripcion: string;
    torreId: number;
    createdAt: string;
    updatedAt: string;
    tower?: Tower;
}

export interface CreateApartmentRequest {
    nombre: string;
    numero: string;
    descripcion: string;
    torreId: number;
}

export interface UpdateApartmentRequest {
    nombre?: string;
    numero?: string;
    descripcion?: string;
    torreId?: number;
}

export interface ApartmentFilters {
    search?: string;
    numero?: string;
    torreId?: number;
    limit?: number;
    page?: number;
}