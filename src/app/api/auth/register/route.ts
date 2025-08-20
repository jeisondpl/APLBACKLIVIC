import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresAuthRepository } from '@/modules/auth/infrastructure/PostgresAuthRepository';
import { RegisterUseCase } from '@/modules/auth/aplications/register';
import { validateRegister } from '@/modules/auth/domain/validations/auth.schema';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const registerData = validateRegister(body);

        const authRepository = new PostgresAuthRepository();
        const registerUseCase = new RegisterUseCase(authRepository);
        const result = await registerUseCase.execute(registerData);

        return createApiResponse(result, 'Usuario registrado exitosamente', 201);
    } catch (error) {
        return handleApiError(error);
    }
}