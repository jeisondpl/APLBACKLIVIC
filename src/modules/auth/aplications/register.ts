import { AuthRepository } from '../domain/models/auth.repository';
import { RegisterRequest, AuthUser } from '../domain/entities/auth.entity';
import { ApiError } from '@/app/lib/api-response';

export class RegisterUseCase {
    constructor(private authRepository: AuthRepository) {}

    async execute(userData: RegisterRequest): Promise<AuthUser> {
        // Check if user already exists
        const existingUser = await this.authRepository.getUserByEmail(userData.email);
        if (existingUser) {
            throw new ApiError('El email ya está registrado', 409);
        }

        // Create new user
        const newUser = await this.authRepository.register(userData);
        
        return newUser;
    }
}