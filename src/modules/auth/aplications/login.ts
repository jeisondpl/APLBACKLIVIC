import { AuthRepository } from '../domain/models/auth.repository';
import { LoginRequest, LoginResponse, AuthUser } from '../domain/entities/auth.entity';
import { ApiError } from '@/app/lib/api-response';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class LoginUseCase {
    constructor(private authRepository: AuthRepository) {}

    async execute(credentials: LoginRequest): Promise<LoginResponse> {
        // Find user by email
        const user = await this.authRepository.getUserByEmail(credentials.email);
        if (!user) {
            throw new ApiError('Credenciales inválidas', 401);
        }

        // Verify password
        const isValidPassword = await this.authRepository.verifyPassword(
            credentials.email, 
            credentials.password
        );
        
        if (!isValidPassword) {
            throw new ApiError('Credenciales inválidas', 401);
        }

        // Generate JWT token
        const JWT_SECRET = process.env.JWT_SECRET || 'livic-secret-key';
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { 
            expiresIn: JWT_EXPIRES_IN 
        });

        // Calculate expiration time in seconds
        const expiresIn = 24 * 60 * 60; // 24 hours in seconds

        return {
            user,
            token,
            expiresIn
        };
    }
}