export interface Tower {
    id: number;
    nombre: string;
    numero: string;
    descripcion: string;
    direccion: string;
    pisos: number;
    apartamentosPorPiso: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTowerRequest {
    nombre: string;
    numero: string;
    descripcion: string;
    direccion: string;
    pisos: number;
    apartamentosPorPiso: number;
}

export interface UpdateTowerRequest {
    nombre?: string;
    numero?: string;
    descripcion?: string;
    direccion?: string;
    pisos?: number;
    apartamentosPorPiso?: number;
}

export interface TowerFilters {
    search?: string;
    numero?: string;
    limit?: number;
    page?: number;
}