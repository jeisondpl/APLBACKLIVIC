export interface User {
    id: number;
    nombre: string;
    email: string;
    edad: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    nombre: string;
    email: string;
    edad: number;
}

export interface UpdateUserRequest {
    nombre?: string;
    email?: string;
    edad?: number;
}

export interface UserFilters {
    search?: string;
    email?: string;
    limit?: number;
    page?: number;
}