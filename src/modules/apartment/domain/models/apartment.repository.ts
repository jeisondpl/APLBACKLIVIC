// src/modules/apartments/domain/apartment.repository.ts

import { Apartment, ApartmentFilters } from "../entities/apartment.entity";

export interface ApartmentRepository {
    findAll(filters: ApartmentFilters): Promise<{ data: Apartment[], total: number }>;
    getById(id: number): Promise<Apartment | null>;
    create(apartment: Apartment): Promise<Apartment>;
    update(id: number, apartment: Partial<Omit<Apartment, "id" | "createdAt" | "updatedAt">>): Promise<Apartment | null>;
    delete(id: number): Promise<boolean>;
    updateMany(apartments: Partial<Apartment>[]): Promise<{ updated: Apartment[], errors?: string[] }>;
    deleteMany(ids: number[]): Promise<{ deleted: Apartment[], notFound?: number[] }>;
}