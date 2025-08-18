export interface ActivityType {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateActivityTypeRequest {
    nombre: string;
    descripcion: string;
    activo?: boolean;
}

export interface UpdateActivityTypeRequest {
    nombre?: string;
    descripcion?: string;
    activo?: boolean;
}

export interface ActivityTypeFilters {
    search?: string;
    activo?: boolean;
    limit?: number;
    page?: number;
}