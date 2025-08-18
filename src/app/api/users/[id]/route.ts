import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresUserRepository } from '@/modules/users/infrastructure/UserRepository';
import { GetUserById } from '@/modules/users/aplications/getUserById';
import { UpdateUser } from '@/modules/users/aplications/updateUser';
import { DeleteUser } from '@/modules/users/aplications/deleteUser';
import { validateUpdateUser } from '@/modules/users/domain/validations/user.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new PostgresUserRepository();
        const useCase = new GetUserById(repo);
        const user = await useCase.execute(id);

        return createApiResponse(user, "Usuario encontrado", 200);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const body = await req.json();
        const validatedData = validateUpdateUser(body);

        const repo = new PostgresUserRepository();
        const useCase = new UpdateUser(repo);
        const updatedUser = await useCase.execute(id, validatedData);

        return createApiResponse(updatedUser, "Usuario actualizado exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new PostgresUserRepository();
        const useCase = new DeleteUser(repo);
        const result = await useCase.execute(id);

        return createApiResponse(result, "Usuario eliminado exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}