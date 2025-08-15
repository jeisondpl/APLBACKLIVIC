// app/api/apartments/route.ts
import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { MemoryApartmentRepository } from '@/modules/apartment/infrastructure/MemoryApartmentRepository';
import { GetApartments } from '@/modules/apartment/aplications/getApartments';


// GET /api/apartments
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            numero: searchParams.get("numero") || undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new MemoryApartmentRepository();
        const useCase = new GetApartments(repo);
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

