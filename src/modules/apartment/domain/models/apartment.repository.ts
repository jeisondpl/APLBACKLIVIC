// src/modules/apartments/domain/apartment.repository.ts

import { Apartment, ApartmentFilters } from "../entities/apartment.entity";

export interface ApartmentRepository {
    findAll(filters: ApartmentFilters): Promise<{ data: Apartment[], total: number }>;
    create(apartment: Apartment): Promise<Apartment>;
    updateMany(apartments: Partial<Apartment>[]): Promise<{ updated: Apartment[], errors?: string[] }>;
    deleteMany(ids: number[]): Promise<{ deleted: Apartment[], notFound?: number[] }>;
}