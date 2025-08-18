import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresActivityTypeRepository } from '@/modules/activity-type/infrastructure/ActivityTypeRepository';
import { GetActivityTypes } from '@/modules/activity-type/aplications/getActivityTypes';
import { CreateActivityType } from '@/modules/activity-type/aplications/createActivityType';
import { validateCreateActivityType } from '@/modules/activity-type/domain/validations/activity-type.schema';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            activo: searchParams.get("activo") ? searchParams.get("activo") === "true" : undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new PostgresActivityTypeRepository();
        const useCase = new GetActivityTypes(repo);
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
        const validatedData = validateCreateActivityType(body);

        const repo = new PostgresActivityTypeRepository();
        const useCase = new CreateActivityType(repo);
        const newActivityType = await useCase.execute(validatedData);

        return createApiResponse(newActivityType, "Tipo de actividad creado exitosamente", 201);
    } catch (error) {
        return handleApiError(error);
    }
}