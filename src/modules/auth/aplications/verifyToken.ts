import { AuthRepository } from '../domain/models/auth.repository';
import { TokenPayload, AuthUser } from '../domain/entities/auth.entity';
import { ApiError } from '@/app/lib/api-response';
import jwt from 'jsonwebtoken';

export class VerifyTokenUseCase {
    constructor(private authRepository: AuthRepository) {}

    async execute(token: string): Promise<AuthUser> {
        try {
            const JWT_SECRET = process.env.JWT_SECRET || 'livic-secret-key';
            
            // Verify and decode token
            const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
            
            // Get user from database to ensure it still exists
            const user = await this.authRepository.getUserById(decoded.userId);
            if (!user) {
                throw new ApiError('Usuario no encontrado', 404);
            }

            return user;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', 401);
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError('Token expirado', 401);
            }
            throw error;
        }
    }
}