import { NextRequest } from 'next/server';
import { PostgresAuthRepository } from '@/modules/auth/infrastructure/PostgresAuthRepository';
import { VerifyTokenUseCase } from '@/modules/auth/aplications/verifyToken';
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity';

export interface AuthenticatedRequest extends NextRequest {
    user?: AuthUser;
}

export async function authenticateToken(req: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        const authRepository = new PostgresAuthRepository();
        const verifyTokenUseCase = new VerifyTokenUseCase(authRepository);
        
        const user = await verifyTokenUseCase.execute(token);
        return user;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

export function requireAuth(roles?: string[]) {
    return async (req: NextRequest): Promise<AuthUser | null> => {
        const user = await authenticateToken(req);
        
        if (!user) {
            return null;
        }

        if (roles && roles.length > 0 && !roles.includes(user.role)) {
            return null;
        }

        return user;
    };
}