export interface Activity {
    id: number;
    nombre: string;
    tipoId: number;
    descripcion: string;
    apartamentoId?: number;
    torreId?: number;
    usuarioAsignadoId?: number;
    estado: ActivityStatus;
    prioridad: ActivityPriority;
    fechaProgramada?: string;
    fechaCompletada?: string;
    notas?: string;
    createdAt: string;
    updatedAt: string;
}

export enum ActivityStatus {
    PENDIENTE = "PENDIENTE",
    EN_PROGRESO = "EN_PROGRESO", 
    COMPLETADA = "COMPLETADA",
    CANCELADA = "CANCELADA"
}

export enum ActivityPriority {
    BAJA = "BAJA",
    MEDIA = "MEDIA",
    ALTA = "ALTA"
}

export interface CreateActivityRequest {
    nombre: string;
    tipoId: number;
    descripcion: string;
    apartamentoId?: number;
    torreId?: number;
    usuarioAsignadoId?: number;
    estado?: ActivityStatus;
    prioridad?: ActivityPriority;
    fechaProgramada?: string;
    fechaCompletada?: string;
    notas?: string;
}

export interface UpdateActivityRequest {
    nombre?: string;
    tipoId?: number;
    descripcion?: string;
    apartamentoId?: number;
    torreId?: number;
    usuarioAsignadoId?: number;
    estado?: ActivityStatus;
    prioridad?: ActivityPriority;
    fechaProgramada?: string;
    fechaCompletada?: string;
    notas?: string;
}

export interface ActivityFilters {
    search?: string;
    tipoId?: number;
    estado?: ActivityStatus;
    apartamentoId?: number;
    torreId?: number;
    usuarioAsignadoId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
    page?: number;
}

