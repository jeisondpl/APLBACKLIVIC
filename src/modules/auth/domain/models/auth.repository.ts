import { AuthUser, LoginRequest, RegisterRequest, ChangePasswordRequest } from '../entities/auth.entity';

export interface AuthRepository {
    login(credentials: LoginRequest): Promise<AuthUser | null>;
    register(userData: RegisterRequest): Promise<AuthUser>;
    getUserById(id: number): Promise<AuthUser | null>;
    getUserByEmail(email: string): Promise<AuthUser | null>;
    updatePassword(userId: number, hashedPassword: string): Promise<void>;
    verifyPassword(email: string, password: string): Promise<boolean>;
    updateUserRole(userId: number, role: 'admin' | 'user' | 'manager'): Promise<AuthUser>;
}