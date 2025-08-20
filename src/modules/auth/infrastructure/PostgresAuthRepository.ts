import { sql } from '@vercel/postgres';
import { AuthRepository } from '../domain/models/auth.repository';
import { AuthUser, LoginRequest, RegisterRequest } from '../domain/entities/auth.entity';
import { ApiError } from '@/app/lib/api-response';
import bcrypt from 'bcryptjs';

export class PostgresAuthRepository implements AuthRepository {
    async login(credentials: LoginRequest): Promise<AuthUser | null> {
        return this.getUserByEmail(credentials.email);
    }

    async register(userData: RegisterRequest): Promise<AuthUser> {
        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const result = await sql`
                INSERT INTO users (nombre, email, edad, password_hash, role, created_at, updated_at)
                VALUES (${userData.nombre}, ${userData.email}, ${userData.edad || null}, ${hashedPassword}, ${userData.role || 'user'}, NOW(), NOW())
                RETURNING id, nombre, email, edad, role, created_at, updated_at
            `;

            if (result.rows.length === 0) {
                throw new ApiError('Error al crear usuario', 500);
            }

            const row = result.rows[0];
            return {
                id: row.id,
                nombre: row.nombre,
                email: row.email,
                role: row.role,
                edad: row.edad,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error: any) {
            if (error.constraint === 'users_email_key') {
                throw new ApiError('El email ya está registrado', 409);
            }
            throw error;
        }
    }

    async getUserById(id: number): Promise<AuthUser | null> {
        try {
            const result = await sql`
                SELECT id, nombre, email, edad, role, created_at, updated_at
                FROM users 
                WHERE id = ${id}
            `;

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return {
                id: row.id,
                nombre: row.nombre,
                email: row.email,
                role: row.role,
                edad: row.edad,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw new ApiError('Error al obtener usuario', 500);
        }
    }

    async getUserByEmail(email: string): Promise<AuthUser | null> {
        try {
            const result = await sql`
                SELECT id, nombre, email, edad, role, created_at, updated_at
                FROM users 
                WHERE email = ${email}
            `;

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return {
                id: row.id,
                nombre: row.nombre,
                email: row.email,
                role: row.role,
                edad: row.edad,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw new ApiError('Error al obtener usuario', 500);
        }
    }

    async updatePassword(userId: number, hashedPassword: string): Promise<void> {
        try {
            await sql`
                UPDATE users 
                SET password_hash = ${hashedPassword}, updated_at = NOW()
                WHERE id = ${userId}
            `;
        } catch (error) {
            console.error('Error updating password:', error);
            throw new ApiError('Error al actualizar contraseña', 500);
        }
    }

    async verifyPassword(email: string, password: string): Promise<boolean> {
        try {
            const result = await sql`
                SELECT password_hash
                FROM users 
                WHERE email = ${email}
            `;

            if (result.rows.length === 0) {
                return false;
            }

            const passwordHash = result.rows[0].password_hash;
            return await bcrypt.compare(password, passwordHash);
        } catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }

    async updateUserRole(userId: number, role: 'admin' | 'user' | 'manager'): Promise<AuthUser> {
        try {
            const result = await sql`
                UPDATE users 
                SET role = ${role}, updated_at = NOW()
                WHERE id = ${userId}
                RETURNING id, nombre, email, edad, role, created_at, updated_at
            `;

            if (result.rows.length === 0) {
                throw new ApiError('Usuario no encontrado', 404);
            }

            const row = result.rows[0];
            return {
                id: row.id,
                nombre: row.nombre,
                email: row.email,
                role: row.role,
                edad: row.edad,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error) {
            console.error('Error updating user role:', error);
            throw new ApiError('Error al actualizar rol de usuario', 500);
        }
    }
}