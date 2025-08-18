import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresActivityTypeRepository } from '@/modules/activity-type/infrastructure/ActivityTypeRepository';
import { GetActivityTypeById } from '@/modules/activity-type/aplications/getActivityTypeById';
import { UpdateActivityType } from '@/modules/activity-type/aplications/updateActivityType';
import { DeleteActivityType } from '@/modules/activity-type/aplications/deleteActivityType';
import { validateUpdateActivityType } from '@/modules/activity-type/domain/validations/activity-type.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new PostgresActivityTypeRepository();
        const useCase = new GetActivityTypeById(repo);
        const activityType = await useCase.execute(id);

        return createApiResponse(activityType, "Tipo de actividad encontrado", 200);
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
        const validatedData = validateUpdateActivityType(body);

        const repo = new PostgresActivityTypeRepository();
        const useCase = new UpdateActivityType(repo);
        const updatedActivityType = await useCase.execute(id, validatedData);

        return createApiResponse(updatedActivityType, "Tipo de actividad actualizado exitosamente", 200);
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

        const repo = new PostgresActivityTypeRepository();
        const useCase = new DeleteActivityType(repo);
        const result = await useCase.execute(id);

        return createApiResponse(result, "Tipo de actividad eliminado exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}