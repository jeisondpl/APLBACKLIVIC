import { NextRequest } from 'next/server';
import { handleApiError, createApiResponse } from '@/app/lib/api-response';
import { PostgresApartmentRepository } from '@/modules/apartment/infrastructure/ApartmentRepository';
import { GetApartmentById } from '@/modules/apartment/aplications/getApartmentById';
import { UpdateApartment } from '@/modules/apartment/aplications/updateApartment';
import { DeleteApartment } from '@/modules/apartment/aplications/deleteApartment';
import { validateUpdateApartment } from '@/modules/apartment/domain/validations/apartment.schema';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return createApiResponse(null, "ID inválido", 400);
        }

        const repo = new PostgresApartmentRepository();
        const useCase = new GetApartmentById(repo);
        const apartment = await useCase.execute(id);

        return createApiResponse(apartment, "Apartamento encontrado", 200);
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
        const validatedData = validateUpdateApartment(body);

        const repo = new PostgresApartmentRepository();
        const useCase = new UpdateApartment(repo);
        const updatedApartment = await useCase.execute(id, validatedData);

        return createApiResponse(updatedApartment, "Apartamento actualizado exitosamente", 200);
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

        const repo = new PostgresApartmentRepository();
        const useCase = new DeleteApartment(repo);
        const result = await useCase.execute(id);

        return createApiResponse(result, "Apartamento eliminado exitosamente", 200);
    } catch (error) {
        return handleApiError(error);
    }
}