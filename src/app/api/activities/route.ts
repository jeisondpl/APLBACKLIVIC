import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresActivityRepository } from '@/modules/activity/infrastructure/ActivityRepository';
import { GetActivities } from '@/modules/activity/aplications/getActivities';
import { CreateActivity } from '@/modules/activity/aplications/createActivity';
import { validateCreateActivity } from '@/modules/activity/domain/validations/activity.schema';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            tipoId: searchParams.get("tipoId") ? parseInt(searchParams.get("tipoId")!) : undefined,
            estado: searchParams.get("estado") || undefined,
            apartamentoId: searchParams.get("apartamentoId") ? parseInt(searchParams.get("apartamentoId")!) : undefined,
            torreId: searchParams.get("torreId") ? parseInt(searchParams.get("torreId")!) : undefined,
            usuarioAsignadoId: searchParams.get("usuarioAsignadoId") ? parseInt(searchParams.get("usuarioAsignadoId")!) : undefined,
            fechaDesde: searchParams.get("fechaDesde") || undefined,
            fechaHasta: searchParams.get("fechaHasta") || undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new PostgresActivityRepository();
        const useCase = new GetActivities(repo);
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
        const validatedData = validateCreateActivity(body);

        const repo = new PostgresActivityRepository();
        const useCase = new CreateActivity(repo);
        const newActivity = await useCase.execute(validatedData);

        return createApiResponse(newActivity, "Actividad creada exitosamente", 201);
    } catch (error) {
        return handleApiError(error);
    }
}