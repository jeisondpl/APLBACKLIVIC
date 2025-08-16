import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { MemoryTowerRepository } from '@/modules/tower/infrastructure/MemoryTowerRepository';
import { GetTowers } from '@/modules/tower/aplications/getTowers';
import { CreateTower } from '@/modules/tower/aplications/createTower';
import { validateCreateTower } from '@/modules/tower/domain/validations/tower.schema';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            numero: searchParams.get("numero") || undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new MemoryTowerRepository();
        const useCase = new GetTowers(repo);
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
        const validatedData = validateCreateTower(body);

        const repo = new MemoryTowerRepository();
        const useCase = new CreateTower(repo);
        const newTower = await useCase.execute(validatedData);

        return createApiResponse(newTower, "Torre creada exitosamente", 201);
    } catch (error) {
        return handleApiError(error);
    }
}