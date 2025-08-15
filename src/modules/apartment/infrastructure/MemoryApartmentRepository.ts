import { ApiError } from "@/app/lib/api-response";
import { Apartment, ApartmentFilters } from "../domain/entities/apartment.entity";
import { ApartmentRepository } from "../domain/models/apartment.repository";



let apartments: Apartment[] = [{
    id: 1,
    nombre: 'Apartamento Premium Vista al Mar',
    numero: 'A101',
    descripcion: 'Hermoso apartamento de 3 habitaciones con vista panorámica al océano, completamente amueblado con acabados de lujo.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
},
{
    id: 2,
    nombre: 'Estudio Moderno Centro',
    numero: 'B205',
    descripcion: 'Acogedor estudio en el corazón de la ciudad, perfecto para profesionales jóvenes. Incluye cocina americana y balcón.',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
},
{
    id: 3,
    nombre: 'Penthouse Ejecutivo',
    numero: 'C501',
    descripcion: 'Penthouse de lujo con terraza privada, 4 habitaciones, 3 baños y jacuzzi. Ubicación privilegiada.',
    createdAt: '2024-01-17T14:15:00Z',
    updatedAt: '2024-01-17T14:15:00Z'
}];

export class MemoryApartmentRepository implements ApartmentRepository {
    async findAll(filters: ApartmentFilters) {
        let filtered = apartments;
        if (filters.search) {
            const term = filters.search.toLowerCase();
            filtered = filtered.filter(a =>
                a.nombre.toLowerCase().includes(term) ||
                a.descripcion.toLowerCase().includes(term)
            );
        }
        if (filters.numero) {
            filtered = filtered.filter(a => a.numero === filters.numero);
        }

        const total = filtered.length;
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        return { data: filtered.slice(start, end), total };
    }

    async create(apartment: Apartment) {
        if (apartments.some(a => a.numero === apartment.numero)) {
            throw new ApiError("Número de apartamento duplicado", 400);
        }
        apartments.push(apartment);
        return apartment;
    }

    async updateMany(list: Partial<Apartment>[]) {
        const updated: Apartment[] = [];
        const errors: string[] = [];

        for (const item of list) {
            const idx = apartments.findIndex(a => a.id === item.id);
            if (idx === -1) {
                errors.push(`ID ${item.id} no encontrado`);
                continue;
            }
            apartments[idx] = { ...apartments[idx], ...item, updatedAt: new Date().toISOString() };
            updated.push(apartments[idx]);
        }
        return { updated, errors: errors.length ? errors : undefined };
    }

    async deleteMany(ids: number[]) {
        const deleted: Apartment[] = [];
        const notFound: number[] = [];
        for (const id of ids) {
            const idx = apartments.findIndex(a => a.id === id);
            if (idx === -1) {
                notFound.push(id);
            } else {
                deleted.push(apartments[idx]);
                apartments.splice(idx, 1);
            }
        }
        return { deleted, notFound: notFound.length ? notFound : undefined };
    }
}