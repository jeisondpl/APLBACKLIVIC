import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresActivityRepository } from '@/modules/activity/infrastructure/ActivityRepository';
import { GetActivityById } from '@/modules/activity/aplications/getActivityById';
import { UpdateActivity } from '@/modules/activity/aplications/updateActivity';
import { DeleteActivity } from '@/modules/activity/aplications/deleteActivity';
import { validateUpdateActivity } from '@/modules/activity/domain/validations/activity.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new PostgresActivityRepository();
        const useCase = new GetActivityById(repo);
        const activity = await useCase.execute(id);

        return createApiResponse(activity, "Actividad encontrada", 200);
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
        const validatedData = validateUpdateActivity(body);

        const repo = new PostgresActivityRepository();
        const useCase = new UpdateActivity(repo);
        const updatedActivity = await useCase.execute(id, validatedData);

        return createApiResponse(updatedActivity, "Actividad actualizada exitosamente", 200);
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

        const repo = new PostgresActivityRepository();
        const useCase = new DeleteActivity(repo);
        const result = await useCase.execute(id);

        return createApiResponse(result, "Actividad eliminada exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}