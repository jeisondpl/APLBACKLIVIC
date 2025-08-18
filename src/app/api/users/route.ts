import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresUserRepository } from '@/modules/users/infrastructure/UserRepository';
import { GetUsers } from '@/modules/users/aplications/getUsers';
import { CreateUser } from '@/modules/users/aplications/createUser';
import { validateCreateUser } from '@/modules/users/domain/validations/user.schema';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            email: searchParams.get("email") || undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new PostgresUserRepository();
        const useCase = new GetUsers(repo);
        const result = await useCase.execute(filters);

        return createApiResponse(result.data, `Total: ${result.total}`, 200, {
            total: result.total,
            page: filters.page,
            limit: filters.limit,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = validateCreateUser(body);

        const repo = new PostgresUserRepository();
        const useCase = new CreateUser(repo);
        const newUser = await useCase.execute(validatedData);

        return createApiResponse(newUser, "Usuario creado exitosamente", 201);
    } catch (error) {
        return handleApiError(error);
    }
}

