import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresAuthRepository } from '@/modules/auth/infrastructure/PostgresAuthRepository';
import { VerifyTokenUseCase } from '@/modules/auth/aplications/verifyToken';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return createApiResponse(null, 'Token es requerido', 400);
        }

        const authRepository = new PostgresAuthRepository();
        const verifyTokenUseCase = new VerifyTokenUseCase(authRepository);
        const user = await verifyTokenUseCase.execute(token);

        return createApiResponse(user, 'Token válido', 200);
    } catch (error) {
        return handleApiError(error);
    }
}