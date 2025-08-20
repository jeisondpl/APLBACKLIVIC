import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresAuthRepository } from '@/modules/auth/infrastructure/PostgresAuthRepository';
import { LoginUseCase } from '@/modules/auth/aplications/login';
import { validateLogin } from '@/modules/auth/domain/validations/auth.schema';

export async function POST(req: NextRequest) {
    try {
        console.log('Login API called');
        const body = await req.json();
        console.log('Request body:', body);
        
        const loginData = validateLogin(body);
        console.log('Validated login data:', loginData);

        const authRepository = new PostgresAuthRepository();
        const loginUseCase = new LoginUseCase(authRepository);
        const result = await loginUseCase.execute(loginData);

        console.log('Login successful:', result);
        return createApiResponse(result, 'Login exitoso', 200);
    } catch (error) {
        console.error('Login error:', error);
        return handleApiError(error);
    }
}