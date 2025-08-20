export interface AuthUser {
    id: number;
    nombre: string;
    email: string;
    role: 'admin' | 'user' | 'manager';
    edad?: number;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: AuthUser;
    token: string;
    expiresIn: number;
}

export interface RegisterRequest {
    nombre: string;
    email: string;
    password: string;
    role?: 'admin' | 'user' | 'manager';
    edad?: number;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface AuthSession {
    userId: number;
    email: string;
    role: string;
    isAuthenticated: boolean;
}