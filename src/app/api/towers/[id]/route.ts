import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { MemoryTowerRepository } from '@/modules/tower/infrastructure/MemoryTowerRepository';
import { GetTowerById } from '@/modules/tower/aplications/getTowerById';
import { UpdateTower } from '@/modules/tower/aplications/updateTower';
import { DeleteTower } from '@/modules/tower/aplications/deleteTower';
import { validateUpdateTower } from '@/modules/tower/domain/validations/tower.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new MemoryTowerRepository();
        const useCase = new GetTowerById(repo);
        const tower = await useCase.execute(id);

        return createApiResponse(tower, "Torre encontrada", 200);
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
        const validatedData = validateUpdateTower(body);

        const repo = new MemoryTowerRepository();
        const useCase = new UpdateTower(repo);
        const updatedTower = await useCase.execute(id, validatedData);

        return createApiResponse(updatedTower, "Torre actualizada exitosamente", 200);
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

        const repo = new MemoryTowerRepository();
        const useCase = new DeleteTower(repo);
        const result = await useCase.execute(id);

        return createApiResponse(result, "Torre eliminada exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}