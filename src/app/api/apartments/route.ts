// app/api/apartments/route.ts
import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresApartmentRepository } from '@/modules/apartment/infrastructure/ApartmentRepository';
import { GetApartments } from '@/modules/apartment/aplications/getApartments';
import { CreateApartment } from '@/modules/apartment/aplications/createApartment';
import { validateCreateApartment } from '@/modules/apartment/domain/validations/apartment.schema';


// GET /api/apartments
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = {
            search: searchParams.get("search") || undefined,
            numero: searchParams.get("numero") || undefined,
            torreId: searchParams.get("torreId") ? parseInt(searchParams.get("torreId")!) : undefined,
            limit: parseInt(searchParams.get("limit") || "10"),
            page: parseInt(searchParams.get("page") || "1"),
        };

        const repo = new PostgresApartmentRepository();
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = validateCreateApartment(body);

        const repo = new PostgresApartmentRepository();
        const useCase = new CreateApartment(repo);
        const newApartment = await useCase.execute(validatedData);

        return createApiResponse(newApartment, "Apartamento creado exitosamente", 201);
    } catch (error) {
        return handleApiError(error);
    }
}

