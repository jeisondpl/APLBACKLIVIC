// lib/apartment-validation.ts
import { CreateApartmentRequest, UpdateApartmentRequest } from '@/modules/apartment/domain/entities/apartment.entity';
import { ApiError } from './api-response';

export function validateCreateApartment(data: any): CreateApartmentRequest {
    const errors: string[] = [];

    if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
        errors.push('El nombre es requerido y debe ser una cadena válida');
    }

    if (!data.numero || typeof data.numero !== 'string' || data.numero.trim() === '') {
        errors.push('El número es requerido y debe ser una cadena válida');
    }

    if (!data.descripcion || typeof data.descripcion !== 'string' || data.descripcion.trim() === '') {
        errors.push('La descripción es requerida y debe ser una cadena válida');
    }

    if (errors.length > 0) {
        throw new ApiError(`Errores de validación: ${errors.join(', ')}`, 400);
    }

    return {
        nombre: data.nombre.trim(),
        numero: data.numero.trim(),
        descripcion: data.descripcion.trim()
    };
}

export function validateUpdateApartment(data: any): UpdateApartmentRequest {
    const validated: UpdateApartmentRequest = {};
    const errors: string[] = [];

    if (data.nombre !== undefined) {
        if (typeof data.nombre !== 'string' || data.nombre.trim() === '') {
            errors.push('El nombre debe ser una cadena válida');
        } else {
            validated.nombre = data.nombre.trim();
        }
    }

    if (data.numero !== undefined) {
        if (typeof data.numero !== 'string' || data.numero.trim() === '') {
            errors.push('El número debe ser una cadena válida');
        } else {
            validated.numero = data.numero.trim();
        }
    }

    if (data.descripcion !== undefined) {
        if (typeof data.descripcion !== 'string' || data.descripcion.trim() === '') {
            errors.push('La descripción debe ser una cadena válida');
        } else {
            validated.descripcion = data.descripcion.trim();
        }
    }

    if (errors.length > 0) {
        throw new ApiError(`Errores de validación: ${errors.join(', ')}`, 400);
    }

    if (Object.keys(validated).length === 0) {
        throw new ApiError('Al menos un campo debe ser proporcionado para actualizar', 400);
    }

    return validated;
}

export function validateApartmentNumber(numero: string, existingApartments: any[], excludeId?: number): void {
    const isDuplicate = existingApartments.some(apt =>
        apt.numero === numero && apt.id !== excludeId
    );

    if (isDuplicate) {
        throw new ApiError(`Ya existe un apartamento con el número ${numero}`, 409);
    }
}